from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_car_owner
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord
from app.repositories.maintenance_repository import MaintenanceRepository
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse

router = APIRouter(prefix="/api/v1/maintenance", tags=["maintenance"])


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
        await require_car_owner(car_id, user.id, db)
        records = await repo.get_car_records(car_id, skip=skip, limit=limit)
        total_result = await db.execute(select(func.count(MaintenanceRecord.id)).where(MaintenanceRecord.car_id == car_id))
    else:
        # Get user's car IDs and filter
        cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
        car_ids = [r[0] for r in cars_result.all()]
        if not car_ids:
            return {"data": [], "meta": {"page": page, "limit": limit, "total": 0, "total_pages": 1}}
        records_result = await db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.car_id.in_(car_ids)).offset(skip).limit(limit)
        )
        records = list(records_result.scalars().all())
        total_result = await db.execute(
            select(func.count(MaintenanceRecord.id)).where(MaintenanceRecord.car_id.in_(car_ids))
        )

    total_count = total_result.scalar() or 0
    return {"data": [MaintenanceResponse.model_validate(r) for r in records], "meta": {"page": page, "limit": limit, "total": total_count, "total_pages": max(1, -(-total_count // limit))}}


@router.get("/{record_id}", response_model=MaintenanceResponse)
async def get_maintenance(record_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    await require_car_owner(record.car_id, user.id, db)
    return record


@router.post("", response_model=MaintenanceResponse)
async def create_maintenance(data: MaintenanceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await require_car_owner(data.car_id, user.id, db)
    repo = MaintenanceRepository(db)
    record = await repo.create(**data.model_dump())
    return record


@router.patch("/{record_id}", response_model=MaintenanceResponse)
async def update_maintenance(record_id: UUID, data: MaintenanceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    await require_car_owner(record.car_id, user.id, db)
    updated = await repo.update(record_id, **data.model_dump(exclude_unset=True))
    return updated


@router.delete("/{record_id}")
async def delete_maintenance(record_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    await require_car_owner(record.car_id, user.id, db)
    await repo.delete(record_id)
    return {"message": "Deleted"}
