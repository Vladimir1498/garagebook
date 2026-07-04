from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


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
