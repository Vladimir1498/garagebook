from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal


class ExpenseCreate(BaseModel):
    car_id: UUID
    category: str
    amount: Decimal
    date: date
    description: str | None = None
    receipt_url: str | None = None


class ExpenseResponse(BaseModel):
    id: UUID
    car_id: UUID
    category: str
    amount: Decimal
    date: date
    description: str | None
    receipt_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True
