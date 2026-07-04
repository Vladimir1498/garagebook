from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
    language: str | None = None
    theme: str | None = None
    timezone: str | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    avatar_url: str | None
    auth_provider: str
    is_active: bool
    is_admin: bool
    language: str
    theme: str
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True
