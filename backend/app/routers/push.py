from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.push_service import save_subscription, remove_subscription, get_vapid_keys

router = APIRouter(prefix="/api/v1/push", tags=["push"])


class SubscriptionRequest(BaseModel):
    endpoint: str
    p256dh: str
    auth: str


class UnsubscribeRequest(BaseModel):
    endpoint: str


@router.post("/subscribe")
async def subscribe(
    data: SubscriptionRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_agent = request.headers.get("user-agent", "")
    await save_subscription(
        user_id=user.id,
        endpoint=data.endpoint,
        p256dh=data.p256dh,
        auth=data.auth,
        user_agent=user_agent,
        db=db,
    )
    return {"message": "Subscribed"}


@router.post("/unsubscribe")
async def unsubscribe(
    data: UnsubscribeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await remove_subscription(endpoint=data.endpoint, user_id=user.id, db=db)
    return {"message": "Unsubscribed"}


@router.get("/vapid-public-key")
async def get_vapid_public_key():
    keys = get_vapid_keys()
    if not keys["public"]:
        return {"public_key": "", "error": "VAPID ключи не настроены. Добавьте VAPID_PUBLIC_KEY и VAPID_PRIVATE_KEY в переменные окружения."}
    return {"public_key": keys["public"]}
