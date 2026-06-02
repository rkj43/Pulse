from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.goals import repository
from app.goals.schemas import GoalCreate, GoalOut, GoalUpdate

router = APIRouter()


@router.get("", response_model=List[GoalOut])
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_goals(db, current_user.id)


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(data: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.create_goal(db, current_user.id, **data.model_dump())


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(goal_id: UUID, data: GoalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = repository.get_goal(db, goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return repository.update_goal(db, goal, **data.model_dump(exclude_none=True))


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = repository.get_goal(db, goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    repository.delete_goal(db, goal)


@router.post("/{goal_id}/update-progress", response_model=GoalOut)
def update_progress(goal_id: UUID, value: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = repository.get_goal(db, goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    updates = {"current_value": value}
    if goal.target_value and value >= goal.target_value:
        updates["status"] = "completed"
    return repository.update_goal(db, goal, **updates)
