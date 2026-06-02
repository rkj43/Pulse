from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.habits import repository, service
from app.habits.schemas import HabitCreate, HabitLogCreate, HabitLogOut, HabitOut, HabitUpdate, StreakOut

router = APIRouter()


@router.get("", response_model=List[HabitOut])
def list_habits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_habits(db, current_user.id)


@router.post("", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
def create_habit(habit_data: HabitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.create_habit(db, current_user.id, **habit_data.model_dump())


@router.put("/{habit_id}", response_model=HabitOut)
def update_habit(habit_id: UUID, habit_data: HabitUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = repository.get_habit(db, habit_id, current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return repository.update_habit(db, habit, **habit_data.model_dump(exclude_none=True))


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(habit_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = repository.get_habit(db, habit_id, current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    repository.delete_habit(db, habit)


@router.post("/{habit_id}/log", response_model=HabitLogOut)
def log_habit(habit_id: UUID, log_data: HabitLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = repository.get_habit(db, habit_id, current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return service.log_habit_completion(db, habit_id, current_user.id, log_data.notes)


@router.get("/streaks", response_model=List[StreakOut])
def get_streaks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_streaks(db, current_user.id)


@router.get("/{habit_id}/stats")
def get_habit_stats(habit_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = repository.get_habit(db, habit_id, current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    streak = repository.get_streak(db, habit_id, current_user.id)
    completion = service.calculate_completion_percentage(db, habit_id, current_user.id)
    return {
        "habit": habit,
        "streak": streak,
        "completion_percentage_30d": completion,
    }
