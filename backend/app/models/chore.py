from sqlalchemy import Column, String, DateTime, ForeignKey, UUID, Boolean, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from ..core.database import Base

class Chore(Base):
    __tablename__ = "chores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    household_id = Column(UUID(as_uuid=True), ForeignKey("households.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=False)
    is_recurring = Column(Boolean, default=False)
    recurrence_interval = Column(String, nullable=True)  # daily, weekly, bi-weekly
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    household = relationship("Household", back_populates="chores")
    created_by = relationship("User", back_populates="created_chores")
    assignments = relationship("ChoreAssignment", back_populates="chore")