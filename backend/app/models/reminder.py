import uuid
from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey, Enum as SAEnum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum


class ReminderType(str, enum.Enum):
    mileage = "mileage"
    date = "date"
    custom = "custom"


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    reminder_type = Column(SAEnum(ReminderType), nullable=False)
    trigger_mileage = Column(Integer, nullable=True)
    trigger_date = Column(Date, nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurring_km = Column(Integer, nullable=True)
    recurring_months = Column(Integer, nullable=True)
    notify_push = Column(Boolean, default=True)
    notify_email = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    car = relationship("Car", back_populates="reminders")
