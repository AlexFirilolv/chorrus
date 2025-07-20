from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class HouseholdBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class HouseholdCreate(HouseholdBase):
    pass

class HouseholdResponse(HouseholdBase):
    id: UUID
    admin_id: UUID
    invite_code: str
    created_at: datetime

    class Config:
        from_attributes = True

class HouseholdWithMembers(HouseholdResponse):
    members: List["UserResponse"] = []

class HouseholdUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)

# Import here to avoid circular imports
from .user import UserResponse
HouseholdWithMembers.model_rebuild()