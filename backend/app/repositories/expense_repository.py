from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, db: AsyncSession):
        super().__init__(Expense, db)

    async def get_car_expenses(self, car_id: UUID, skip: int = 0, limit: int = 100) -> list[Expense]:
        result = await self.db.execute(
            select(Expense).where(Expense.car_id == car_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
