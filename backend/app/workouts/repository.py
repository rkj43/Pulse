from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.workouts.models import (
    Exercise, WorkoutTemplate, WorkoutTemplateExercise,
    WorkoutSession, WorkoutSessionLog, WeeklySchedule
)


def get_templates(db: Session, user_id: UUID) -> List[WorkoutTemplate]:
    return db.query(WorkoutTemplate).filter(WorkoutTemplate.user_id == user_id).all()


def get_template(db: Session, template_id: UUID, user_id: UUID) -> Optional[WorkoutTemplate]:
    return db.query(WorkoutTemplate).filter(
        WorkoutTemplate.id == template_id, WorkoutTemplate.user_id == user_id
    ).first()


def create_template(db: Session, user_id: UUID, **kwargs) -> WorkoutTemplate:
    template = WorkoutTemplate(user_id=user_id, **kwargs)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def update_template(db: Session, template: WorkoutTemplate, **kwargs) -> WorkoutTemplate:
    for k, v in kwargs.items():
        setattr(template, k, v)
    db.commit()
    db.refresh(template)
    return template


def delete_template(db: Session, template: WorkoutTemplate):
    db.delete(template)
    db.commit()


def get_weekly_schedule(db: Session, user_id: UUID) -> List[WeeklySchedule]:
    return db.query(WeeklySchedule).filter(WeeklySchedule.user_id == user_id).all()


def upsert_schedule_entry(db: Session, user_id: UUID, day_of_week: int, template_id: Optional[UUID]) -> WeeklySchedule:
    entry = db.query(WeeklySchedule).filter(
        WeeklySchedule.user_id == user_id, WeeklySchedule.day_of_week == day_of_week
    ).first()
    if entry:
        entry.template_id = template_id
    else:
        entry = WeeklySchedule(user_id=user_id, day_of_week=day_of_week, template_id=template_id)
        db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_sessions(db: Session, user_id: UUID) -> List[WorkoutSession]:
    return db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id).order_by(WorkoutSession.date.desc()).all()


def get_session(db: Session, session_id: UUID, user_id: UUID) -> Optional[WorkoutSession]:
    return db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id, WorkoutSession.user_id == user_id
    ).first()


def create_session(db: Session, user_id: UUID, **kwargs) -> WorkoutSession:
    session = WorkoutSession(user_id=user_id, **kwargs)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def update_session(db: Session, session: WorkoutSession, **kwargs) -> WorkoutSession:
    for k, v in kwargs.items():
        setattr(session, k, v)
    db.commit()
    db.refresh(session)
    return session


def create_session_log(db: Session, session_id: UUID, **kwargs) -> WorkoutSessionLog:
    log = WorkoutSessionLog(session_id=session_id, **kwargs)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_exercise_progress(db: Session, user_id: UUID, exercise_name: str):
    exercise = db.query(Exercise).filter(Exercise.name.ilike(f"%{exercise_name}%")).first()
    if not exercise:
        return []
    logs = (
        db.query(WorkoutSessionLog, WorkoutSession)
        .join(WorkoutSession, WorkoutSessionLog.session_id == WorkoutSession.id)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSessionLog.exercise_id == exercise.id,
            WorkoutSessionLog.weight_kg.isnot(None),
        )
        .order_by(WorkoutSession.date)
        .all()
    )
    return [{"date": s.date.isoformat(), "weight_kg": l.weight_kg, "reps": l.reps} for l, s in logs]
