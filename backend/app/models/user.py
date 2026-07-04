import uuid
from sqlalchemy import Column, String, Boolean, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import enum


class AuthProvider(str, enum.Enum):
    local = "local"
    google = "google"
    apple = "apple"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    auth_provider = Column(SAEnum(AuthProvider), default=AuthProvider.local, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    language = Column(String(10), default="ru")
    theme = Column(String(10), default="system")
    timezone = Column(String(50), default="Europe/Moscow")

    cars = relationship("Car", back_populates="owner", cascade="all, delete-orphan")
    organizations = relationship("OrganizationMember", back_populates="user")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
