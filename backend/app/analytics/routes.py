from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.analytics import service
from app.analytics.schemas import InsightOut

router = APIRouter()


@router.get("/insights", response_model=List[InsightOut])
def get_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_insights(db, current_user.id)


@router.get("/habits/summary")
def habits_summary(days: int = Query(30), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_habit_summary(db, current_user.id, days)


@router.get("/workouts/summary")
def workouts_summary(days: int = Query(30), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_workout_summary(db, current_user.id, days)


@router.get("/health/summary")
def health_summary(days: int = Query(30), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return service.get_health_summary(db, current_user.id, days)
