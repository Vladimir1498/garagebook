from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime


class ReminderCreate(BaseModel):
    car_id: UUID
    title: str
    reminder_type: str
    trigger_mileage: int | None = None
    trigger_date: date | None = None
    is_recurring: bool = False
    recurring_km: int | None = None
    recurring_months: int | None = None
    notify_push: bool = True
    notify_email: bool = False


class ReminderResponse(BaseModel):
    id: UUID
    car_id: UUID
    title: str
    reminder_type: str
    trigger_mileage: int | None
    trigger_date: date | None
    is_recurring: bool
    recurring_km: int | None
    recurring_months: int | None
    notify_push: bool
    notify_email: bool
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True
