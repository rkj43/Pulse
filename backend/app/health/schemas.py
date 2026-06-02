from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MetricType(str, Enum):
    steps = "steps"
    sleep_hours = "sleep_hours"
    resting_hr = "resting_hr"
    weight = "weight"
    calories = "calories"
    water_ml = "water_ml"


class HealthMetricCreate(BaseModel):
    date: Optional[datetime] = None
    metric_type: str
    value: float
    source: Optional[str] = None


class HealthMetricOut(BaseModel):
    id: UUID
    user_id: UUID
    date: datetime
    metric_type: str
    value: float
    source: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
