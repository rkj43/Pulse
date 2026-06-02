from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_frequency: int = 1
    frequency_unit: str = "daily"


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_frequency: Optional[int] = None
    frequency_unit: Optional[str] = None
    active: Optional[bool] = None


class HabitOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    target_frequency: int
    frequency_unit: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class HabitLogCreate(BaseModel):
    notes: Optional[str] = None


class HabitLogOut(BaseModel):
    id: UUID
    habit_id: UUID
    user_id: UUID
    completed_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True


class StreakOut(BaseModel):
    id: UUID
    entity_type: str
    entity_id: UUID
    user_id: UUID
    current_streak: int
    best_streak: int
    last_completed: Optional[datetime]

    class Config:
        from_attributes = True
