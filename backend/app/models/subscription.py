import uuid
from sqlalchemy import Column, String, ForeignKey, Enum as SAEnum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum


class SubscriptionTier(str, enum.Enum):
    free = "free"
    pro = "pro"
    fleet = "fleet"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    canceled = "canceled"
    past_due = "past_due"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    tier = Column(SAEnum(SubscriptionTier), default=SubscriptionTier.free, nullable=False)
    stripe_subscription_id = Column(String(255), nullable=True)
    status = Column(SAEnum(SubscriptionStatus), default=SubscriptionStatus.active, nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="subscription")
