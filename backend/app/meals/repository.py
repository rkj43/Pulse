from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.meals.models import MealTemplate, MealPlan, MealPlanEntry


def get_templates(db: Session, user_id: UUID) -> List[MealTemplate]:
    return db.query(MealTemplate).filter(MealTemplate.user_id == user_id).all()


def create_template(db: Session, user_id: UUID, **kwargs) -> MealTemplate:
    template = MealTemplate(user_id=user_id, **kwargs)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def get_plan_by_week(db: Session, user_id: UUID, week_start: date) -> Optional[MealPlan]:
    return db.query(MealPlan).filter(
        MealPlan.user_id == user_id, MealPlan.week_start_date == week_start
    ).first()


def get_current_plan(db: Session, user_id: UUID) -> Optional[MealPlan]:
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    return get_plan_by_week(db, user_id, week_start)


def upsert_plan(db: Session, user_id: UUID, week_start: date, entries_data: list) -> MealPlan:
    plan = get_plan_by_week(db, user_id, week_start)
    if not plan:
        plan = MealPlan(user_id=user_id, week_start_date=week_start)
        db.add(plan)
        db.flush()
    else:
        db.query(MealPlanEntry).filter(MealPlanEntry.plan_id == plan.id).delete()
        db.flush()

    for entry_data in entries_data:
        entry = MealPlanEntry(plan_id=plan.id, **entry_data)
        db.add(entry)

    db.commit()
    db.refresh(plan)
    return plan


def get_plan_entries(db: Session, plan_id: UUID) -> List[MealPlanEntry]:
    return db.query(MealPlanEntry).filter(MealPlanEntry.plan_id == plan_id).all()


def duplicate_last_week(db: Session, user_id: UUID) -> Optional[MealPlan]:
    today = date.today()
    current_week_start = today - timedelta(days=today.weekday())
    last_week_start = current_week_start - timedelta(weeks=1)

    last_plan = get_plan_by_week(db, user_id, last_week_start)
    if not last_plan:
        return None

    last_entries = get_plan_entries(db, last_plan.id)
    entries_data = [
        {
            "day_of_week": e.day_of_week,
            "meal_type": e.meal_type,
            "meal_template_id": e.meal_template_id,
            "custom_meal_name": e.custom_meal_name,
            "notes": e.notes,
        }
        for e in last_entries
    ]
    return upsert_plan(db, user_id, current_week_start, entries_data)
