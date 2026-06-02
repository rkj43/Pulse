from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.workouts import repository
from app.workouts.schemas import (
    WorkoutTemplateCreate, WorkoutTemplateOut, WorkoutTemplateUpdate,
    WorkoutSessionCreate, WorkoutSessionOut, WorkoutSessionUpdate,
    WeeklyScheduleEntry, WeeklyScheduleOut,
)

router = APIRouter()


@router.get("/templates", response_model=List[WorkoutTemplateOut])
def list_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_templates(db, current_user.id)


@router.post("/templates", response_model=WorkoutTemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(data: WorkoutTemplateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.create_template(db, current_user.id, name=data.name, description=data.description, day_of_week=data.day_of_week)


@router.put("/templates/{template_id}", response_model=WorkoutTemplateOut)
def update_template(template_id: UUID, data: WorkoutTemplateUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    template = repository.get_template(db, template_id, current_user.id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return repository.update_template(db, template, **data.model_dump(exclude_none=True))


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    template = repository.get_template(db, template_id, current_user.id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    repository.delete_template(db, template)


@router.get("/schedule", response_model=List[WeeklyScheduleOut])
def get_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_weekly_schedule(db, current_user.id)


@router.put("/schedule")
def update_schedule(entries: List[WeeklyScheduleEntry], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = []
    for entry in entries:
        result = repository.upsert_schedule_entry(db, current_user.id, entry.day_of_week, entry.template_id)
        results.append(result)
    return results


@router.get("/sessions", response_model=List[WorkoutSessionOut])
def list_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_sessions(db, current_user.id)


@router.post("/sessions", response_model=WorkoutSessionOut, status_code=status.HTTP_201_CREATED)
def create_session(data: WorkoutSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = repository.create_session(
        db, current_user.id,
        template_id=data.template_id,
        date=data.date,
        duration_minutes=data.duration_minutes,
        notes=data.notes,
        completed=data.completed,
    )
    for log in (data.logs or []):
        repository.create_session_log(db, session.id, **log.model_dump())
    return session


@router.get("/sessions/{session_id}", response_model=WorkoutSessionOut)
def get_session(session_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = repository.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/sessions/{session_id}", response_model=WorkoutSessionOut)
def update_session(session_id: UUID, data: WorkoutSessionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = repository.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return repository.update_session(db, session, **data.model_dump(exclude_none=True))


@router.get("/progress/{exercise_name}")
def get_progress(exercise_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_exercise_progress(db, current_user.id, exercise_name)
