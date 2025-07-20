from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import Optional, List

class ChoreBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    due_date: date
    is_recurring: bool = False
    recurrence_interval: Optional[str] = Field(None, pattern="^(daily|weekly|bi-weekly)$")

class ChoreCreate(ChoreBase):
    assigned_user_ids: Optional[List[UUID]] = []

class ChoreResponse(ChoreBase):
    id: UUID
    household_id: UUID
    created_by_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ChoreWithAssignments(ChoreResponse):
    assignments: List["ChoreAssignmentResponse"] = []

class ChoreUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    due_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    recurrence_interval: Optional[str] = Field(None, pattern="^(daily|weekly|bi-weekly)$")

# Import here to avoid circular imports
from .chore_assignment import ChoreAssignmentResponse
ChoreWithAssignments.model_rebuild()