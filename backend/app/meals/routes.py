from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.meals import repository
from app.meals.schemas import MealTemplateCreate, MealTemplateOut, MealPlanCreate, MealPlanOut

router = APIRouter()


@router.get("/templates", response_model=List[MealTemplateOut])
def list_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_templates(db, current_user.id)


@router.post("/templates", response_model=MealTemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(data: MealTemplateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.create_template(db, current_user.id, **data.model_dump())


@router.get("/plan/current")
def get_current_plan(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = repository.get_current_plan(db, current_user.id)
    if not plan:
        return None
    entries = repository.get_plan_entries(db, plan.id)
    return {**plan.__dict__, "entries": entries}


@router.get("/plan/{week_start}")
def get_plan_by_week(week_start: date, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = repository.get_plan_by_week(db, current_user.id, week_start)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    entries = repository.get_plan_entries(db, plan.id)
    return {**plan.__dict__, "entries": entries}


@router.put("/plan")
def upsert_plan(data: MealPlanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries_data = [e.model_dump() for e in data.entries]
    plan = repository.upsert_plan(db, current_user.id, data.week_start_date, entries_data)
    entries = repository.get_plan_entries(db, plan.id)
    return {**plan.__dict__, "entries": entries}


@router.post("/plan/duplicate")
def duplicate_plan(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = repository.duplicate_last_week(db, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="No plan found for last week")
    entries = repository.get_plan_entries(db, plan.id)
    return {**plan.__dict__, "entries": entries}
