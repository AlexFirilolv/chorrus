from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None

class UserCreate(UserBase):
    firebase_uid: str

class UserResponse(UserBase):
    id: UUID
    household_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    display_name: Optional[str] = None