from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class OrganizationCreate(BaseModel):
    name: str


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    owner_id: UUID
    logo_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class InviteRequest(BaseModel):
    email: str
    role: str = "viewer"


class MemberResponse(BaseModel):
    id: UUID
    organization_id: UUID
    user_id: UUID
    role: str
    created_at: datetime
    user: dict | None = None

    class Config:
        from_attributes = True


class AddCarRequest(BaseModel):
    car_id: UUID


class OrganizationCarResponse(BaseModel):
    id: UUID
    organization_id: UUID
    car_id: UUID
    created_at: datetime
    car: dict | None = None

    class Config:
        from_attributes = True
