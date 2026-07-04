from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal


class MaintenanceCreate(BaseModel):
    car_id: UUID
    service_type: str
    custom_type: str | None = None
    date: date
    mileage: int
    cost: Decimal
    description: str | None = None
    service_center: str | None = None
    photo_url: str | None = None
    receipt_url: str | None = None


class MaintenanceResponse(BaseModel):
    id: UUID
    car_id: UUID
    service_type: str
    custom_type: str | None
    date: date
    mileage: int
    cost: Decimal
    description: str | None
    service_center: str | None
    photo_url: str | None
    receipt_url: str | None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
