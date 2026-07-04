import os
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.core.deps import get_current_user
from app.core.tiers import get_user_subscription
from app.models.user import User
from app.models.document import Document
from app.models.subscription import SubscriptionTier
from app.repositories.document_repository import DocumentRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentResponse

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


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
        documents = await repo.get_car_documents(car_id, skip=skip, limit=limit)
    else:
        documents = await repo.get_all(skip=skip, limit=limit)
    return {"data": [DocumentResponse.model_validate(d) for d in documents], "meta": {"page": page, "limit": limit, "total": len(documents), "total_pages": 1}}


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = DocumentRepository(db)
    doc = await repo.get(doc_id)
    if not doc:
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
    # Check document limit for free tier
    sub = await get_user_subscription(user, db)
    if sub.tier == SubscriptionTier.free:
        car_uuid = UUID(car_id)
        docs_result = await db.execute(select(Document).where(Document.car_id == car_uuid))
        if len(docs_result.scalars().all()) >= 5:
            raise HTTPException(status_code=403, detail="На бесплатном тарифе до 5 документов. Обновите тариф.")
    car_uuid = UUID(car_id)

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, "documents", car_id)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename or "document")
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    file_url = f"/uploads/documents/{car_id}/{file.filename}"
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
    if not await repo.delete(doc_id):
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Deleted"}
