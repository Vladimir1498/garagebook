from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class DocumentCreate(BaseModel):
    car_id: UUID
    name: str
    category: str
    notes: str | None = None


class DocumentResponse(BaseModel):
    id: UUID
    car_id: UUID
    name: str
    category: str
    file_url: str
    file_type: str
    file_size: int
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True
