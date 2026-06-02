from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ReminderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    schedule_type: str = "daily"
    cron_expression: Optional[str] = None


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    schedule_type: Optional[str] = None
    cron_expression: Optional[str] = None
    active: Optional[bool] = None


class ReminderOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    schedule_type: str
    cron_expression: Optional[str]
    active: bool
    next_run: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationEventOut(BaseModel):
    id: UUID
    reminder_id: UUID
    user_id: UUID
    scheduled_time: datetime
    completed: bool
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
