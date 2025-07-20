from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ChoreAssignmentBase(BaseModel):
    chore_id: UUID
    user_id: UUID

class ChoreAssignmentCreate(ChoreAssignmentBase):
    pass

class ChoreAssignmentResponse(ChoreAssignmentBase):
    id: UUID
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChoreAssignmentUpdate(BaseModel):
    status: str

class MarkComplete(BaseModel):
    status: str = "completed"