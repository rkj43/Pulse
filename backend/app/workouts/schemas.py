from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class ExerciseOut(BaseModel):
    id: UUID
    name: str
    muscle_group: Optional[str]
    equipment: Optional[str]

    class Config:
        from_attributes = True


class WorkoutTemplateExerciseCreate(BaseModel):
    exercise_id: UUID
    sets: int = 3
    reps: Optional[int] = None
    duration_seconds: Optional[int] = None
    order: int = 0


class WorkoutTemplateExerciseOut(BaseModel):
    id: UUID
    template_id: UUID
    exercise_id: UUID
    sets: int
    reps: Optional[int]
    duration_seconds: Optional[int]
    order: int

    class Config:
        from_attributes = True


class WorkoutTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    day_of_week: Optional[int] = None
    exercises: Optional[List[WorkoutTemplateExerciseCreate]] = []


class WorkoutTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    day_of_week: Optional[int] = None


class WorkoutTemplateOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    day_of_week: Optional[int]

    class Config:
        from_attributes = True


class WorkoutSessionLogCreate(BaseModel):
    exercise_id: UUID
    set_number: int = 1
    weight_kg: Optional[float] = None
    reps: Optional[int] = None
    completed: bool = True


class WorkoutSessionLogOut(BaseModel):
    id: UUID
    session_id: UUID
    exercise_id: UUID
    set_number: int
    weight_kg: Optional[float]
    reps: Optional[int]
    completed: bool

    class Config:
        from_attributes = True


class WorkoutSessionCreate(BaseModel):
    template_id: Optional[UUID] = None
    date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    completed: bool = False
    logs: Optional[List[WorkoutSessionLogCreate]] = []


class WorkoutSessionUpdate(BaseModel):
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    completed: Optional[bool] = None


class WorkoutSessionOut(BaseModel):
    id: UUID
    user_id: UUID
    template_id: Optional[UUID]
    date: datetime
    duration_minutes: Optional[int]
    notes: Optional[str]
    completed: bool

    class Config:
        from_attributes = True


class WeeklyScheduleEntry(BaseModel):
    day_of_week: int
    template_id: Optional[UUID] = None


class WeeklyScheduleOut(BaseModel):
    id: UUID
    user_id: UUID
    day_of_week: int
    template_id: Optional[UUID]

    class Config:
        from_attributes = True
