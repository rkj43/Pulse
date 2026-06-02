from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler

from app.database import SessionLocal


def run_nightly_analytics_job():
    from app.analytics.service import run_nightly_analytics
    db = SessionLocal()
    try:
        run_nightly_analytics(db)
    finally:
        db.close()


def generate_daily_notification_events():
    from app.reminders.models import Reminder, NotificationEvent
    db = SessionLocal()
    try:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        active_reminders = db.query(Reminder).filter(Reminder.active == True).all()
        for reminder in active_reminders:
            existing = db.query(NotificationEvent).filter(
                NotificationEvent.reminder_id == reminder.id,
                NotificationEvent.scheduled_time >= today_start,
                NotificationEvent.scheduled_time < today_end,
            ).first()
            if not existing:
                event = NotificationEvent(
                    reminder_id=reminder.id,
                    user_id=reminder.user_id,
                    scheduled_time=today_start.replace(hour=9),
                )
                db.add(event)
        db.commit()
    finally:
        db.close()


_scheduler = None


def start_scheduler():
    global _scheduler
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(run_nightly_analytics_job, "cron", hour=2, minute=0, id="nightly_analytics")
    _scheduler.add_job(generate_daily_notification_events, "cron", hour=0, minute=5, id="daily_notifications")
    _scheduler.start()
