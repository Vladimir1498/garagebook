from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class CheckoutRequest(BaseModel):
    tier: str


class SubscriptionResponse(BaseModel):
    id: UUID
    user_id: UUID
    tier: str
    stripe_subscription_id: str | None
    status: str
    current_period_end: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
