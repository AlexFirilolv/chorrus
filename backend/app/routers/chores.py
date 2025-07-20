from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..core.auth import get_current_active_user
from ..models.user import User
from ..models.household import Household
from ..models.chore import Chore
from ..models.chore_assignment import ChoreAssignment
from ..schemas.chore import (
    ChoreCreate,
    ChoreResponse,
    ChoreWithAssignments,
    ChoreUpdate
)
from ..schemas.chore_assignment import ChoreAssignmentResponse

router = APIRouter(prefix="/chores", tags=["chores"])

@router.post("/", response_model=ChoreResponse)
async def create_chore(
    chore: ChoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new chore"""
    if not current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a household to create chores"
        )
    
    db_chore = Chore(
        household_id=current_user.household_id,
        created_by_id=current_user.id,
        title=chore.title,
        description=chore.description,
        due_date=chore.due_date,
        is_recurring=chore.is_recurring,
        recurrence_interval=chore.recurrence_interval
    )
    
    db.add(db_chore)
    db.commit()
    db.refresh(db_chore)
    
    # Assign users if provided
    if chore.assigned_user_ids:
        for user_id in chore.assigned_user_ids:
            user = db.query(User).filter(
                User.id == user_id,
                User.household_id == current_user.household_id
            ).first()
            
            if user:
                assignment = ChoreAssignment(
                    chore_id=db_chore.id,
                    user_id=user_id
                )
                db.add(assignment)
        
        db.commit()
    
    return db_chore

@router.get("/", response_model=List[ChoreWithAssignments])
async def get_chores(
    household_id: Optional[UUID] = None,
    include_completed: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get chores for current user's household"""
    if not current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a household to view chores"
        )
    
    query = db.query(Chore).filter(Chore.household_id == current_user.household_id)
    
    if not include_completed:
        # Only get chores with pending assignments
        query = query.join(ChoreAssignment).filter(ChoreAssignment.status == "pending")
    
    chores = query.order_by(Chore.due_date).all()
    
    # Load assignments for each chore
    for chore in chores:
        chore.assignments = db.query(ChoreAssignment).filter(
            ChoreAssignment.chore_id == chore.id
        ).all()
    
    return chores

@router.get("/my-chores", response_model=List[ChoreWithAssignments])
async def get_my_chores(
    include_completed: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get chores assigned to current user"""
    if not current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a household to view chores"
        )
    
    query = db.query(Chore).join(ChoreAssignment).filter(
        ChoreAssignment.user_id == current_user.id,
        Chore.household_id == current_user.household_id
    )
    
    if not include_completed:
        query = query.filter(ChoreAssignment.status == "pending")
    
    chores = query.order_by(Chore.due_date).all()
    
    # Load assignments for each chore
    for chore in chores:
        chore.assignments = db.query(ChoreAssignment).filter(
            ChoreAssignment.chore_id == chore.id
        ).all()
    
    return chores

@router.get("/{chore_id}", response_model=ChoreWithAssignments)
async def get_chore(
    chore_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific chore details"""
    if not current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a household to view chores"
        )
    
    chore = db.query(Chore).filter(
        Chore.id == chore_id,
        Chore.household_id == current_user.household_id
    ).first()
    
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found"
        )
    
    # Load assignments
    chore.assignments = db.query(ChoreAssignment).filter(
        ChoreAssignment.chore_id == chore.id
    ).all()
    
    return chore

@router.put("/{chore_id}", response_model=ChoreResponse)
async def update_chore(
    chore_id: UUID,
    chore_update: ChoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update chore details"""
    if not current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a household to update chores"
        )
    
    chore = db.query(Chore).filter(
        Chore.id == chore_id,
        Chore.household_id == current_user.household_id
    ).first()
    
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found"
        )
    
    # Check if user has permission (creator or admin)
    household = db.query(Household).filter(Household.id == current_user.household_id).first()
    if chore.created_by_id != current_user.id and household.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only chore creator or household admin can update chore"
        )
    
    update_data = chore_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chore, field, value)
    
    db.commit()
    db.refresh(chore)
    
    return chore

@router.delete("/{chore_id}", response_model=dict)
async def delete_chore(
    chore_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a chore"""
    if not current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a household to delete chores"
        )
    
    chore = db.query(Chore).filter(
        Chore.id == chore_id,
        Chore.household_id == current_user.household_id
    ).first()
    
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found"
        )
    
    # Check if user has permission (creator or admin)
    household = db.query(Household).filter(Household.id == current_user.household_id).first()
    if chore.created_by_id != current_user.id and household.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only chore creator or household admin can delete chore"
        )
    
    # Delete assignments first
    db.query(ChoreAssignment).filter(ChoreAssignment.chore_id == chore_id).delete()
    
    # Delete chore
    db.delete(chore)
    db.commit()
    
    return {"message": "Chore deleted successfully"}

@router.post("/{chore_id}/complete", response_model=ChoreAssignmentResponse)
async def mark_chore_complete(
    chore_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a chore as complete for current user"""
    if not current_user.household_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must belong to a household to complete chores"
        )
    
    assignment = db.query(ChoreAssignment).join(Chore).filter(
        ChoreAssignment.chore_id == chore_id,
        ChoreAssignment.user_id == current_user.id,
        Chore.household_id == current_user.household_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore assignment not found"
        )
    
    assignment.status = "completed"
    assignment.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(assignment)
    
    return assignment