from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord
from app.repositories.maintenance_repository import MaintenanceRepository
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse

router = APIRouter(prefix="/api/v1/maintenance", tags=["maintenance"])


async def _verify_car_ownership(car_id: UUID, user_id: UUID, db) -> bool:
    result = await db.execute(select(Car.id).where(Car.id == car_id, Car.user_id == user_id))
    return result.scalar() is not None


@router.get("")
async def list_maintenance(
    car_id: UUID | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = MaintenanceRepository(db)
    skip = (page - 1) * limit
    if car_id:
        if not await _verify_car_ownership(car_id, user.id, db):
            raise HTTPException(status_code=404, detail="Car not found")
        records = await repo.get_car_records(car_id, skip=skip, limit=limit)
        total_result = await db.execute(select(func.count(MaintenanceRecord.id)).where(MaintenanceRecord.car_id == car_id))
    else:
        records = await repo.get_all(skip=skip, limit=limit)
        total_result = await db.execute(select(func.count(MaintenanceRecord.id)))

    total_count = total_result.scalar() or 0
    return {"data": [MaintenanceResponse.model_validate(r) for r in records], "meta": {"page": page, "limit": limit, "total": total_count, "total_pages": max(1, -(-total_count // limit))}}


@router.get("/{record_id}", response_model=MaintenanceResponse)
async def get_maintenance(record_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    # Verify ownership via car
    result = await db.execute(select(Car.id).where(Car.id == record.car_id, Car.user_id == user.id))
    if result.scalar() is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.post("", response_model=MaintenanceResponse)
async def create_maintenance(data: MaintenanceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify car ownership
    result = await db.execute(select(Car.id).where(Car.id == data.car_id, Car.user_id == user.id))
    if result.scalar() is None:
        raise HTTPException(status_code=404, detail="Car not found")
    repo = MaintenanceRepository(db)
    record = await repo.create(**data.model_dump())
    return record


@router.patch("/{record_id}", response_model=MaintenanceResponse)
async def update_maintenance(record_id: UUID, data: MaintenanceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    result = await db.execute(select(Car.id).where(Car.id == record.car_id, Car.user_id == user.id))
    if result.scalar() is None:
        raise HTTPException(status_code=404, detail="Record not found")
    updated = await repo.update(record_id, **data.model_dump(exclude_unset=True))
    return updated


@router.delete("/{record_id}")
async def delete_maintenance(record_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    result = await db.execute(select(Car.id).where(Car.id == record.car_id, Car.user_id == user.id))
    if result.scalar() is None:
        raise HTTPException(status_code=404, detail="Record not found")
    await repo.delete(record_id)
    return {"message": "Deleted"}
