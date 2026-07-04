import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SAEnum, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import enum


class NotificationType(str, enum.Enum):
    reminder = "reminder"
    system = "system"
    maintenance = "maintenance"
    payment = "payment"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    type = Column(SAEnum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
