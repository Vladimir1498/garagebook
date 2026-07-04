from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.car import Car
from app.repositories.base import BaseRepository


class CarRepository(BaseRepository[Car]):
    def __init__(self, db: AsyncSession):
        super().__init__(Car, db)

    async def get_user_cars(self, user_id: UUID, skip: int = 0, limit: int = 100) -> list[Car]:
        result = await self.db.execute(
            select(Car).where(Car.user_id == user_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_user_cars(self, user_id: UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Car).where(Car.user_id == user_id)
        )
        return result.scalar() or 0
