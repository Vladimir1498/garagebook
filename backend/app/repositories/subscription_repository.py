from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.subscription import Subscription
from app.repositories.base import BaseRepository


class SubscriptionRepository(BaseRepository[Subscription]):
    def __init__(self, db: AsyncSession):
        super().__init__(Subscription, db)

    async def get_by_user(self, user_id: UUID) -> Subscription | None:
        result = await self.db.execute(select(Subscription).where(Subscription.user_id == user_id))
        return result.scalar_one_or_none()
