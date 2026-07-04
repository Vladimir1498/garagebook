import uuid
from sqlalchemy import Column, String, Integer, Numeric, Date, ForeignKey, Enum as SAEnum, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum


class ServiceType(str, enum.Enum):
    oil_change = "oil_change"
    filter = "filter"
    spark_plugs = "spark_plugs"
    brakes = "brakes"
    suspension = "suspension"
    timing_belt = "timing_belt"
    engine_repair = "engine_repair"
    custom = "custom"


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id", ondelete="CASCADE"), nullable=False)
    service_type = Column(SAEnum(ServiceType), nullable=False)
    custom_type = Column(String(100), nullable=True)
    date = Column(Date, nullable=False)
    mileage = Column(Integer, nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    service_center = Column(String(255), nullable=True)
    photo_url = Column(String(500), nullable=True)
    receipt_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    car = relationship("Car", back_populates="maintenance_records")
