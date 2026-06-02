from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.habits.models import Habit, HabitLog, Streak


def get_habits(db: Session, user_id: UUID) -> List[Habit]:
    return db.query(Habit).filter(Habit.user_id == user_id).all()


def get_habit(db: Session, habit_id: UUID, user_id: UUID) -> Optional[Habit]:
    return db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()


def create_habit(db: Session, user_id: UUID, **kwargs) -> Habit:
    habit = Habit(user_id=user_id, **kwargs)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


def update_habit(db: Session, habit: Habit, **kwargs) -> Habit:
    for key, value in kwargs.items():
        if value is not None:
            setattr(habit, key, value)
    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, habit: Habit):
    db.delete(habit)
    db.commit()


def create_habit_log(db: Session, habit_id: UUID, user_id: UUID, notes: Optional[str] = None) -> HabitLog:
    log = HabitLog(habit_id=habit_id, user_id=user_id, notes=notes)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_habit_logs(db: Session, habit_id: UUID, user_id: UUID) -> List[HabitLog]:
    return db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == user_id
    ).order_by(HabitLog.completed_at.desc()).all()


def get_streak(db: Session, entity_id: UUID, user_id: UUID) -> Optional[Streak]:
    return db.query(Streak).filter(
        Streak.entity_id == entity_id,
        Streak.user_id == user_id
    ).first()


def upsert_streak(db: Session, entity_type: str, entity_id: UUID, user_id: UUID,
                  current_streak: int, best_streak: int, last_completed) -> Streak:
    streak = get_streak(db, entity_id, user_id)
    if streak:
        streak.current_streak = current_streak
        streak.best_streak = best_streak
        streak.last_completed = last_completed
    else:
        streak = Streak(
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            current_streak=current_streak,
            best_streak=best_streak,
            last_completed=last_completed,
        )
        db.add(streak)
    db.commit()
    db.refresh(streak)
    return streak
