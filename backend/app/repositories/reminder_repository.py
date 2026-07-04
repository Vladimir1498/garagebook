from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.reminder import Reminder
from app.repositories.base import BaseRepository


class ReminderRepository(BaseRepository[Reminder]):
    def __init__(self, db: AsyncSession):
        super().__init__(Reminder, db)

    async def get_car_reminders(self, car_id: UUID) -> list[Reminder]:
        result = await self.db.execute(
            select(Reminder).where(Reminder.car_id == car_id)
        )
        return list(result.scalars().all())
