from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal


class CarCreate(BaseModel):
    brand: str
    model: str
    year: int
    vin: str | None = None
    license_plate: str | None = None
    fuel_type: str = "petrol"
    engine_volume: float | None = None
    transmission: str = "automatic"
    color: str | None = None
    mileage: int = 0
    purchase_date: date | None = None
    photo_url: str | None = None
    insurance_expiry: date | None = None
    inspection_expiry: date | None = None


class CarUpdate(BaseModel):
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    vin: str | None = None
    license_plate: str | None = None
    fuel_type: str | None = None
    engine_volume: float | None = None
    transmission: str | None = None
    color: str | None = None
    mileage: int | None = None
    purchase_date: date | None = None
    photo_url: str | None = None
    insurance_expiry: date | None = None
    inspection_expiry: date | None = None


class CarResponse(BaseModel):
    id: UUID
    user_id: UUID
    brand: str
    model: str
    year: int
    vin: str | None
    license_plate: str | None
    fuel_type: str
    engine_volume: float | None
    transmission: str
    color: str | None
    mileage: int
    purchase_date: date | None
    photo_url: str | None
    insurance_expiry: date | None
    inspection_expiry: date | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
