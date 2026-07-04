import os
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.core.deps import get_current_user
from app.core.tiers import get_user_subscription
from app.models.user import User
from app.models.car import Car
from app.models.subscription import SubscriptionTier
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
    # Check car limit for free tier
    sub = await get_user_subscription(user, db)
    if sub.tier == SubscriptionTier.free:
        result = await db.execute(select(Car).where(Car.user_id == user.id))
        if len(result.scalars().all()) >= 1:
            raise HTTPException(status_code=403, detail="На бесплатном тарифе можно добавить только 1 автомобиль. Обновите тариф.")

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

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, "cars", str(car_id))
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
    file_path = os.path.join(upload_dir, f"photo{ext}")
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Generate absolute URL
    if request:
        base_url = str(request.base_url).rstrip("/")
    else:
        base_url = os.environ.get("BACKEND_URL", "http://localhost:8000")
    photo_url = f"{base_url}/uploads/cars/{car_id}/photo{ext}"
    await repo.update(car_id, photo_url=photo_url)
    return {"photo_url": photo_url}
