import uuid
from sqlalchemy import Column, String, Integer, Numeric, Date, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
import enum


class FuelType(str, enum.Enum):
    petrol = "petrol"
    diesel = "diesel"
    electric = "electric"
    hybrid = "hybrid"


class TransmissionType(str, enum.Enum):
    manual = "manual"
    automatic = "automatic"
    cvt = "cvt"
    robotic = "robotic"


class Car(TimestampMixin, Base):
    __tablename__ = "cars"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    vin = Column(String(17), nullable=True)
    license_plate = Column(String(20), nullable=True)
    fuel_type = Column(SAEnum(FuelType), default=FuelType.petrol, nullable=False)
    engine_volume = Column(Numeric(3, 1), nullable=True)
    transmission = Column(SAEnum(TransmissionType), default=TransmissionType.automatic, nullable=False)
    color = Column(String(50), nullable=True)
    mileage = Column(Integer, default=0)
    purchase_date = Column(Date, nullable=True)
    photo_url = Column(Text, nullable=True)
    insurance_expiry = Column(Date, nullable=True)
    inspection_expiry = Column(Date, nullable=True)

    owner = relationship("User", back_populates="cars")
    maintenance_records = relationship("MaintenanceRecord", back_populates="car", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="car", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="car", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="car", cascade="all, delete-orphan")
