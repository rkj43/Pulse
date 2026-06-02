import json
from datetime import datetime, timedelta
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.analytics.models import Insight
from app.habits.models import Habit, HabitLog
from app.workouts.models import WorkoutSession
from app.health.models import HealthMetric


def generate_habit_insights(user_id: UUID, db: Session) -> List[Insight]:
    insights = []
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.active == True).all()
    for habit in habits:
        logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.user_id == user_id,
            HabitLog.completed_at >= thirty_days_ago,
        ).all()

        total_days = 30
        completed_days = len(set(log.completed_at.date() for log in logs))
        rate = round((completed_days / total_days) * 100, 1)

        weekday_completions = sum(1 for log in logs if log.completed_at.weekday() < 5)
        weekend_completions = sum(1 for log in logs if log.completed_at.weekday() >= 5)

        title = f"Habit '{habit.name}': {rate}% completion rate"
        description = (
            f"In the last 30 days, you completed '{habit.name}' on {completed_days} days ({rate}%). "
            f"Weekday completions: {weekday_completions}, Weekend completions: {weekend_completions}."
        )
        data = {"habit_id": str(habit.id), "completion_rate": rate, "weekday": weekday_completions, "weekend": weekend_completions}

        insight = Insight(
            user_id=user_id,
            title=title,
            description=description,
            category="habits",
            data_json=json.dumps(data),
        )
        insights.append(insight)

    return insights


def generate_workout_insights(user_id: UUID, db: Session) -> List[Insight]:
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= thirty_days_ago,
        WorkoutSession.completed == True,
    ).all()

    total = len(sessions)
    weeks = 4
    avg_per_week = round(total / weeks, 1)

    insight = Insight(
        user_id=user_id,
        title=f"Workout consistency: {total} sessions in 30 days",
        description=f"You completed {total} workout sessions in the last 30 days, averaging {avg_per_week} per week.",
        category="workouts",
        data_json=json.dumps({"total_sessions": total, "avg_per_week": avg_per_week}),
    )
    return [insight]


def generate_sleep_insights(user_id: UUID, db: Session) -> List[Insight]:
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    sleep_metrics = db.query(HealthMetric).filter(
        HealthMetric.user_id == user_id,
        HealthMetric.metric_type == "sleep_hours",
        HealthMetric.date >= thirty_days_ago,
    ).all()

    if not sleep_metrics:
        return []

    avg_sleep = round(sum(m.value for m in sleep_metrics) / len(sleep_metrics), 1)

    workout_dates = set()
    workout_sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= thirty_days_ago,
    ).all()
    for s in workout_sessions:
        workout_dates.add(s.date.date())

    workout_day_sleep = [m.value for m in sleep_metrics if m.date.date() in workout_dates]
    rest_day_sleep = [m.value for m in sleep_metrics if m.date.date() not in workout_dates]

    avg_workout_sleep = round(sum(workout_day_sleep) / len(workout_day_sleep), 1) if workout_day_sleep else 0
    avg_rest_sleep = round(sum(rest_day_sleep) / len(rest_day_sleep), 1) if rest_day_sleep else 0

    insight = Insight(
        user_id=user_id,
        title=f"Average sleep: {avg_sleep} hours/night",
        description=(
            f"Your average sleep over the last 30 days is {avg_sleep} hours. "
            f"On workout days: {avg_workout_sleep}h vs rest days: {avg_rest_sleep}h."
        ),
        category="health",
        data_json=json.dumps({"avg_sleep": avg_sleep, "workout_day_avg": avg_workout_sleep, "rest_day_avg": avg_rest_sleep}),
    )
    return [insight]


def run_nightly_analytics(db: Session):
    from app.auth.models import User
    users = db.query(User).filter(User.is_active == True).all()
    for user in users:
        all_insights = (
            generate_habit_insights(user.id, db)
            + generate_workout_insights(user.id, db)
            + generate_sleep_insights(user.id, db)
        )
        for insight in all_insights:
            db.add(insight)
    db.commit()


def get_insights(db: Session, user_id: UUID) -> List[Insight]:
    return db.query(Insight).filter(Insight.user_id == user_id).order_by(Insight.created_at.desc()).limit(20).all()


def get_habit_summary(db: Session, user_id: UUID, days: int = 30):
    start = datetime.utcnow() - timedelta(days=days)
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.active == True).all()
    result = []
    for habit in habits:
        logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.user_id == user_id,
            HabitLog.completed_at >= start,
        ).all()
        completed = len(set(log.completed_at.date() for log in logs))
        result.append({"habit_name": habit.name, "completed_days": completed, "completion_rate": round(completed / days * 100, 1)})
    return result


def get_workout_summary(db: Session, user_id: UUID, days: int = 30):
    start = datetime.utcnow() - timedelta(days=days)
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= start,
        WorkoutSession.completed == True,
    ).all()
    by_week = {}
    for s in sessions:
        week = s.date.isocalendar()[1]
        by_week[week] = by_week.get(week, 0) + 1
    return {"total_sessions": len(sessions), "by_week": by_week}


def get_health_summary(db: Session, user_id: UUID, days: int = 30):
    start = datetime.utcnow() - timedelta(days=days)
    metrics = db.query(HealthMetric).filter(
        HealthMetric.user_id == user_id,
        HealthMetric.date >= start,
    ).all()
    by_type = {}
    for m in metrics:
        if m.metric_type not in by_type:
            by_type[m.metric_type] = []
        by_type[m.metric_type].append({"date": m.date.isoformat(), "value": m.value})
    return by_type
