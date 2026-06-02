from datetime import datetime, timedelta
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.habits import repository
from app.habits.models import Habit, HabitLog, Streak


def log_habit_completion(db: Session, habit_id: UUID, user_id: UUID, notes: str = None) -> HabitLog:
    log = repository.create_habit_log(db, habit_id, user_id, notes)
    _update_streak(db, habit_id, user_id)
    return log


def _update_streak(db: Session, habit_id: UUID, user_id: UUID):
    streak = repository.get_streak(db, habit_id, user_id)
    now = datetime.utcnow()

    if streak is None:
        repository.upsert_streak(db, "habit", habit_id, user_id, 1, 1, now)
        return

    last = streak.last_completed
    if last is None:
        new_current = 1
    else:
        delta = (now.date() - last.date()).days
        if delta == 0:
            return  # already logged today
        elif delta == 1:
            new_current = streak.current_streak + 1
        else:
            new_current = 1

    new_best = max(streak.best_streak, new_current)
    repository.upsert_streak(db, "habit", habit_id, user_id, new_current, new_best, now)


def get_today_habits(db: Session, user_id: UUID) -> List[Habit]:
    return db.query(Habit).filter(Habit.user_id == user_id, Habit.active == True).all()


def calculate_completion_percentage(db: Session, habit_id: UUID, user_id: UUID, days: int = 30) -> float:
    start = datetime.utcnow() - timedelta(days=days)
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == user_id,
        HabitLog.completed_at >= start,
    ).all()
    completed_days = len(set(log.completed_at.date() for log in logs))
    return round((completed_days / days) * 100, 1)


def get_streaks(db: Session, user_id: UUID) -> List[Streak]:
    return db.query(Streak).filter(Streak.user_id == user_id).all()
