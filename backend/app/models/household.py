from sqlalchemy import Column, String, DateTime, ForeignKey, UUID, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from ..core.database import Base

class Household(Base):
    __tablename__ = "households"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    invite_code = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("User", back_populates="household")
    admin = relationship("User", foreign_keys=[admin_id])
    chores = relationship("Chore", back_populates="household")