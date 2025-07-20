from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ..core.database import get_db
from ..core.auth import get_current_active_user
from ..core.security import generate_invite_code
from ..models.user import User
from ..models.household import Household
from ..schemas.household import (
    HouseholdCreate,
    HouseholdResponse,
    HouseholdWithMembers,
    HouseholdUpdate
)

router = APIRouter(prefix="/households", tags=["households"])

@router.post("/", response_model=HouseholdResponse)
async def create_household(
    household: HouseholdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new household"""
    if current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to a household"
        )
    
    invite_code = generate_invite_code()
    
    # Ensure unique invite code
    while db.query(Household).filter(Household.invite_code == invite_code).first():
        invite_code = generate_invite_code()
    
    db_household = Household(
        name=household.name,
        admin_id=current_user.id,
        invite_code=invite_code
    )
    
    db.add(db_household)
    db.commit()
    db.refresh(db_household)
    
    # Update user's household_id
    current_user.household_id = db_household.id
    db.commit()
    
    return db_household

@router.get("/{household_id}", response_model=HouseholdWithMembers)
async def get_household(
    household_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get household details and members"""
    if not current_user.household_id or current_user.household_id != household_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to this household"
        )
    
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found"
        )
    
    members = db.query(User).filter(User.household_id == household_id).all()
    household.members = members
    
    return household

@router.put("/{household_id}", response_model=HouseholdResponse)
async def update_household(
    household_id: UUID,
    household_update: HouseholdUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update household details"""
    if not current_user.household_id or current_user.household_id != household_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to this household"
        )
    
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found"
        )
    
    if household.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only household admin can update household"
        )
    
    if household_update.name is not None:
        household.name = household_update.name
    
    db.commit()
    db.refresh(household)
    
    return household

@router.post("/{household_id}/invites", response_model=dict)
async def generate_invite(
    household_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a new invite code"""
    if not current_user.household_id or current_user.household_id != household_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to this household"
        )
    
    household = db.query(Household).filter(Household.id == household_id).first()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found"
        )
    
    if household.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only household admin can generate invites"
        )
    
    # Generate new invite code
    invite_code = generate_invite_code()
    while db.query(Household).filter(Household.invite_code == invite_code).first():
        invite_code = generate_invite_code()
    
    household.invite_code = invite_code
    db.commit()
    
    return {
        "invite_code": invite_code,
        "invite_url": f"http://localhost:3000/join?code={invite_code}"
    }

@router.post("/join", response_model=HouseholdResponse)
async def join_household(
    invite_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Join a household using an invite code"""
    if current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already belongs to a household"
        )
    
    household = db.query(Household).filter(Household.invite_code == invite_code).first()
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite code"
        )
    
    current_user.household_id = household.id
    db.commit()
    
    return household