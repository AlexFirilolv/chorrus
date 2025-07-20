from sqlalchemy import Column, String, DateTime, ForeignKey, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from ..core.database import Base

class ChoreAssignment(Base):
    __tablename__ = "chore_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    chore_id = Column(UUID(as_uuid=True), ForeignKey("chores.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, completed
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chore = relationship("Chore", back_populates="assignments")
    user = relationship("User", back_populates="chore_assignments")