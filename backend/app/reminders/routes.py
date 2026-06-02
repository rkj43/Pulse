from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.reminders import repository
from app.reminders.schemas import ReminderCreate, ReminderOut, ReminderUpdate, NotificationEventOut

router = APIRouter()


@router.get("", response_model=List[ReminderOut])
def list_reminders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_reminders(db, current_user.id)


@router.post("", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(reminder_data: ReminderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.create_reminder(db, current_user.id, **reminder_data.model_dump())


@router.put("/{reminder_id}", response_model=ReminderOut)
def update_reminder(reminder_id: UUID, reminder_data: ReminderUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reminder = repository.get_reminder(db, reminder_id, current_user.id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return repository.update_reminder(db, reminder, **reminder_data.model_dump(exclude_none=True))


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reminder = repository.get_reminder(db, reminder_id, current_user.id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    repository.delete_reminder(db, reminder)


@router.get("/pending", response_model=List[NotificationEventOut])
def get_pending(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_pending_notifications(db, current_user.id)


@router.post("/{reminder_id}/complete")
def complete_reminder(reminder_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = repository.complete_notification(db, reminder_id, current_user.id)
    if not event:
        raise HTTPException(status_code=404, detail="Notification event not found")
    return event
