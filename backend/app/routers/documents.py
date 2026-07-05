import os
import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.core.deps import get_current_user
from app.core.tiers import get_user_subscription, _get_subscription
from app.models.user import User
from app.models.car import Car
from app.models.document import Document
from app.models.subscription import SubscriptionTier
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentResponse

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

# Allowed file extensions for upload
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


async def _verify_car_ownership(car_id: UUID, user_id: UUID, db: AsyncSession) -> bool:
    """Check that a car belongs to the given user."""
    from sqlalchemy import select as sa_select
    from app.models.car import Car as CarModel
    result = await db.execute(sa_select(CarModel.id).where(CarModel.id == car_id, CarModel.user_id == user_id))
    return result.scalar() is not None


def _sanitize_filename(filename: str) -> str:
    """Strip path components and dangerous characters from filename."""
    # Remove path separators
    name = os.path.basename(filename)
    # Remove null bytes
    name = name.replace("\x00", "")
    # Limit length
    name = name[:200]
    if not name:
        name = "document"
    return name


@router.get("")
async def list_documents(
    car_id: UUID | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    skip = (page - 1) * limit
    if car_id:
        # Verify ownership
        if not await _verify_car_ownership(car_id, user.id, db):
            raise HTTPException(status_code=404, detail="Car not found")
        documents = await repo.get_car_documents(car_id, skip=skip, limit=limit)
        total_result = await db.execute(select(func.count(Document.id)).where(Document.car_id == car_id))
    else:
        # Get all user's car IDs first
        cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
        car_ids = [r[0] for r in cars_result.all()]
        if not car_ids:
            documents = []
            total = 0
        else:
            documents = await repo.get_all(skip=skip, limit=limit)
            total_result = await db.execute(select(func.count(Document.id)))
            total = total_result.scalar() or 0

    total_count = total_result.scalar() if car_id else (total if 'total' in dir() else len(documents))
    return {
        "data": [DocumentResponse.model_validate(d) for d in documents],
        "meta": {"page": page, "limit": limit, "total": total_count, "total_pages": max(1, -(-total_count // limit))}
    }


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = DocumentRepository(db)
    doc = await repo.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Verify ownership via car
    if not await _verify_car_ownership(doc.car_id, user.id, db):
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    car_id: str = Form(...),
    name: str = Form(...),
    category: str = Form("other"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate car_id format
    try:
        car_uuid = UUID(car_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid car_id")

    # Verify car ownership
    if not await _verify_car_ownership(car_uuid, user.id, db):
        raise HTTPException(status_code=404, detail="Car not found")

    # Check document limit for free tier - count ALL documents across ALL user's cars
    sub = await _get_subscription(user.id, db)
    if sub.tier == SubscriptionTier.free:
        # Get all user's car IDs
        cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
        all_car_ids = [r[0] for r in cars_result.all()]
        if all_car_ids:
            count_result = await db.execute(select(func.count(Document.id)).where(Document.car_id.in_(all_car_ids)))
            current_count = count_result.scalar() or 0
            if current_count >= 5:
                raise HTTPException(
                    status_code=403,
                    detail="На бесплатном тарифе максимальное количество документов — 5. Обновите тариф для неограниченного хранения."
                )

    # Validate file extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read and validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)} MB")

    # Save file with sanitized name
    safe_name = _sanitize_filename(file.filename or "document")
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
    upload_dir = os.path.join(settings.UPLOAD_DIR, "documents", car_id)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_name)
    with open(file_path, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/documents/{car_id}/{unique_name}"
    file_type = file.content_type or "application/octet-stream"
    file_size = len(contents)

    repo = DocumentRepository(db)
    doc = await repo.create(
        car_id=car_uuid, name=name, category=category,
        file_url=file_url, file_type=file_type,
        file_size=file_size,
    )
    return doc


@router.delete("/{doc_id}")
async def delete_document(doc_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = DocumentRepository(db)
    doc = await repo.get(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not await _verify_car_ownership(doc.car_id, user.id, db):
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    if doc.file_url:
        file_path = os.path.join(settings.UPLOAD_DIR, doc.file_url.lstrip("/"))
        if os.path.exists(file_path):
            os.remove(file_path)

    await repo.delete(doc_id)
    return {"message": "Deleted"}
