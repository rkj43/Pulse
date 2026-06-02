from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.habits.service import get_today_habits, get_streaks
from app.workouts.models import WorkoutSession, WeeklySchedule
from app.health.repository import get_today_summary
from app.goals.repository import get_goals


def get_today_dashboard(db: Session, user_id: UUID) -> dict:
    today = datetime.utcnow()
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    day_of_week = today.weekday()

    habits = get_today_habits(db, user_id)
    streaks = get_streaks(db, user_id)
    health = get_today_summary(db, user_id)
    goals = get_goals(db, user_id)

    # Today's workout from schedule
    schedule_entry = db.query(WeeklySchedule).filter(
        WeeklySchedule.user_id == user_id,
        WeeklySchedule.day_of_week == day_of_week,
    ).first()

    # Today's completed sessions
    today_sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= today_start,
    ).all()

    return {
        "date": today.isoformat(),
        "habits": habits,
        "streaks": streaks,
        "health_summary": health,
        "goals": goals,
        "today_schedule": schedule_entry,
        "today_sessions": today_sessions,
    }
