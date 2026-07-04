from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.subscription import CheckoutRequest, SubscriptionResponse
from app.repositories.subscription_repository import SubscriptionRepository

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = SubscriptionRepository(db)
    sub = await repo.get_by_user(user.id)
    if not sub:
        # Create free subscription
        sub = await repo.create(user_id=user.id, tier="free", status="active")
    return sub


@router.post("/checkout")
async def create_checkout(data: CheckoutRequest, user: User = Depends(get_current_user)):
    # TODO: integrate with Stripe
    return {"url": f"/pricing?tier={data.tier}&status=success"}


@router.post("/portal")
async def create_portal(user: User = Depends(get_current_user)):
    # TODO: integrate with Stripe customer portal
    return {"url": "/settings"}
