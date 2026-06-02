from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    goal_type: Optional[str] = None
    target_value: Optional[float] = None
    current_value: float = 0
    unit: Optional[str] = None
    target_date: Optional[datetime] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    goal_type: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None


class GoalOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    goal_type: Optional[str]
    target_value: Optional[float]
    current_value: float
    unit: Optional[str]
    target_date: Optional[datetime]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
