from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionTier
from app.repositories.subscription_repository import SubscriptionRepository


async def get_user_subscription(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> Subscription:
    repo = SubscriptionRepository(db)
    sub = await repo.get_by_user(user.id)
    if not sub:
        # Create free subscription by default
        sub = await repo.create(user_id=user.id, tier=SubscriptionTier.free, status="active")
    return sub


def require_tier(minimum_tier: SubscriptionTier):
    tier_order = {SubscriptionTier.free: 0, SubscriptionTier.pro: 1, SubscriptionTier.fleet: 2}

    async def check(sub: Subscription = Depends(get_user_subscription)):
        if tier_order.get(sub.tier, 0) < tier_order.get(minimum_tier, 0):
            raise HTTPException(
                status_code=403,
                detail=f"Эта функция доступна на тарифе {minimum_tier.value} и выше. Текущий тариф: {sub.tier.value}"
            )
        return sub
    return check


async def check_car_limit(user: User = Depends(get_current_user), sub: Subscription = Depends(get_user_subscription), db: AsyncSession = Depends(get_db)):
    if sub.tier == SubscriptionTier.free:
        from app.models.car import Car
        result = await db.execute(select(Car).where(Car.user_id == user.id))
        count = len(result.scalars().all())
        if count >= 1:
            raise HTTPException(status_code=403, detail="На бесплатном тарифе можно добавить только 1 автомобиль. Обновите тариф для неограниченного количества.")
    return sub


async def check_document_limit(user: User = Depends(get_current_user), sub: Subscription = Depends(get_user_subscription), db: AsyncSession = Depends(get_db)):
    if sub.tier == SubscriptionTier.free:
        from app.models.document import Document
        from app.models.car import Car
        cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
        car_ids = [r[0] for r in cars_result.all()]
        if car_ids:
            docs_result = await db.execute(select(Document).where(Document.car_id.in_(car_ids)))
            count = len(docs_result.scalars().all())
            if count >= 5:
                raise HTTPException(status_code=403, detail="На бесплатном тарифе можно загрузить до 5 документов. Обновите тариф для неограниченного хранения.")
    return sub
