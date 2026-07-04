import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Enum as SAEnum, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum


class DocumentCategory(str, enum.Enum):
    insurance = "insurance"
    sts = "sts"
    diagnostics = "diagnostics"
    work_order = "work_order"
    receipt = "receipt"
    other = "other"


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    car_id = Column(UUID(as_uuid=True), ForeignKey("cars.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(SAEnum(DocumentCategory), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    car = relationship("Car", back_populates="documents")
