from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.reminders.models import Reminder, NotificationEvent


def get_reminders(db: Session, user_id: UUID) -> List[Reminder]:
    return db.query(Reminder).filter(Reminder.user_id == user_id).all()


def get_reminder(db: Session, reminder_id: UUID, user_id: UUID) -> Optional[Reminder]:
    return db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == user_id).first()


def create_reminder(db: Session, user_id: UUID, **kwargs) -> Reminder:
    reminder = Reminder(user_id=user_id, **kwargs)
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def update_reminder(db: Session, reminder: Reminder, **kwargs) -> Reminder:
    for key, value in kwargs.items():
        setattr(reminder, key, value)
    db.commit()
    db.refresh(reminder)
    return reminder


def delete_reminder(db: Session, reminder: Reminder):
    db.delete(reminder)
    db.commit()


def get_pending_notifications(db: Session, user_id: UUID) -> List[NotificationEvent]:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
    return db.query(NotificationEvent).filter(
        NotificationEvent.user_id == user_id,
        NotificationEvent.scheduled_time >= today_start,
        NotificationEvent.scheduled_time <= today_end,
        NotificationEvent.completed == False,
    ).all()


def complete_notification(db: Session, event_id: UUID, user_id: UUID) -> Optional[NotificationEvent]:
    event = db.query(NotificationEvent).filter(
        NotificationEvent.id == event_id,
        NotificationEvent.user_id == user_id,
    ).first()
    if event:
        event.completed = True
        event.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(event)
    return event


def create_notification_event(db: Session, reminder_id: UUID, user_id: UUID, scheduled_time: datetime) -> NotificationEvent:
    event = NotificationEvent(reminder_id=reminder_id, user_id=user_id, scheduled_time=scheduled_time)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
