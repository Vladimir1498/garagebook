import os
import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.core.deps import get_current_user
from app.core.tiers import get_user_subscription
from app.models.user import User
from app.models.car import Car
from app.repositories.car_repository import CarRepository
from app.schemas.car import CarCreate, CarUpdate, CarResponse

router = APIRouter(prefix="/api/v1/cars", tags=["cars"])


@router.get("")
async def list_cars(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = CarRepository(db)
    skip = (page - 1) * limit
    cars = await repo.get_user_cars(user.id, skip=skip, limit=limit)
    total = await repo.count_user_cars(user.id)
    return {
        "data": [CarResponse.model_validate(c) for c in cars],
        "meta": {"page": page, "limit": limit, "total": total, "total_pages": -(-total // limit)},
    }


@router.get("/{car_id}", response_model=CarResponse)
async def get_car(car_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = CarRepository(db)
    car = await repo.get(car_id)
    if not car or car.user_id != user.id:
        raise HTTPException(status_code=404, detail="Car not found")
    return car


@router.post("", response_model=CarResponse)
async def create_car(
    data: CarCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = CarRepository(db)
    car = await repo.create(user_id=user.id, **data.model_dump())
    return car


@router.patch("/{car_id}", response_model=CarResponse)
async def update_car(
    car_id: UUID,
    data: CarUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = CarRepository(db)
    car = await repo.get(car_id)
    if not car or car.user_id != user.id:
        raise HTTPException(status_code=404, detail="Car not found")
    updated = await repo.update(car_id, **data.model_dump(exclude_unset=True))
    return updated


@router.delete("/{car_id}")
async def delete_car(car_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = CarRepository(db)
    car = await repo.get(car_id)
    if not car or car.user_id != user.id:
        raise HTTPException(status_code=404, detail="Car not found")
    await repo.delete(car_id)
    return {"message": "Deleted"}


@router.get("/{car_id}/photo")
async def get_car_photo(car_id: UUID):
    """Serve car photo — supports base64 data URLs stored in DB."""
    from fastapi.responses import Response
    from app.core.database import async_session

    async with async_session() as db:
        result = await db.execute(select(Car.photo_url).where(Car.id == car_id))
        photo_url = result.scalar_one_or_none()

    if not photo_url:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Handle data URL (base64)
    if photo_url.startswith("data:"):
        header, data = photo_url.split(",", 1)
        media_type = header.split(":")[1].split(";")[0]
        import base64
        img_bytes = base64.b64decode(data)
        return Response(content=img_bytes, media_type=media_type)

    # Fallback: file on disk
    upload_dir = os.path.join(settings.UPLOAD_DIR, "cars", str(car_id))
    for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        file_path = os.path.join(upload_dir, f"photo{ext}")
        if os.path.exists(file_path):
            return FileResponse(file_path)

    raise HTTPException(status_code=404, detail="Photo not found")


@router.post("/{car_id}/photo")
async def upload_photo(
    car_id: UUID,
    file: UploadFile = File(...),
    request: Request = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = CarRepository(db)
    car = await repo.get(car_id)
    if not car or car.user_id != user.id:
        raise HTTPException(status_code=404, detail="Car not found")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "cars", str(car_id))
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    file_path = os.path.join(upload_dir, f"photo{ext}")
    contents = await file.read()

    # Store as base64 in database (persistent across deploys on Railway)
    import base64
    b64 = base64.b64encode(contents).decode("utf-8")
    content_type = file.content_type or "image/jpeg"
    photo_url = f"data:{content_type};base64,{b64}"

    await repo.update(car_id, photo_url=photo_url)
    return {"photo_url": "saved to database"}
