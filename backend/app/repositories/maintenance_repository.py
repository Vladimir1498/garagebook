from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.maintenance import MaintenanceRecord
from app.repositories.base import BaseRepository


class MaintenanceRepository(BaseRepository[MaintenanceRecord]):
    def __init__(self, db: AsyncSession):
        super().__init__(MaintenanceRecord, db)

    async def get_car_records(self, car_id: UUID, skip: int = 0, limit: int = 100) -> list[MaintenanceRecord]:
        result = await self.db.execute(
            select(MaintenanceRecord).where(MaintenanceRecord.car_id == car_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
