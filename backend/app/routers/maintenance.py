from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
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
    # Filter by user's cars
    if car_id:
        records = await repo.get_car_records(car_id, skip=skip, limit=limit)
    else:
        records = await repo.get_all(skip=skip, limit=limit)
    return {"data": [MaintenanceResponse.model_validate(r) for r in records], "meta": {"page": page, "limit": limit, "total": len(records), "total_pages": 1}}


@router.get("/{record_id}", response_model=MaintenanceResponse)
async def get_maintenance(record_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.post("", response_model=MaintenanceResponse)
async def create_maintenance(data: MaintenanceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    import logging
    logging.warning(f"MAINTENANCE CREATE: {data.model_dump()}")
    repo = MaintenanceRepository(db)
    record = await repo.create(**data.model_dump())
    return record


@router.patch("/{record_id}", response_model=MaintenanceResponse)
async def update_maintenance(record_id: UUID, data: MaintenanceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    record = await repo.update(record_id, **data.model_dump(exclude_unset=True))
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.delete("/{record_id}")
async def delete_maintenance(record_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = MaintenanceRepository(db)
    if not await repo.delete(record_id):
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Deleted"}
