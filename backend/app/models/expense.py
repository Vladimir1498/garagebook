import uuid
from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Enum as SAEnum, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum


class ExpenseCategory(str, enum.Enum):
    fuel = "fuel"
    maintenance = "maintenance"
    repair = "repair"
    insurance = "insurance"
    tax = "tax"
    parking = "parking"
    fine = "fine"
    wash = "wash"
    tires = "tires"
    other = "other"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id", ondelete="CASCADE"), nullable=False)
    category = Column(SAEnum(ExpenseCategory), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    car = relationship("Car", back_populates="expenses")
