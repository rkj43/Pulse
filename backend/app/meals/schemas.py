from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class MealTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    meal_type: str = "lunch"


class MealTemplateOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    meal_type: str

    class Config:
        from_attributes = True


class MealPlanEntryCreate(BaseModel):
    day_of_week: int
    meal_type: str
    meal_template_id: Optional[UUID] = None
    custom_meal_name: Optional[str] = None
    notes: Optional[str] = None


class MealPlanEntryOut(BaseModel):
    id: UUID
    plan_id: UUID
    day_of_week: int
    meal_type: str
    meal_template_id: Optional[UUID]
    custom_meal_name: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True


class MealPlanCreate(BaseModel):
    week_start_date: date
    entries: List[MealPlanEntryCreate] = []


class MealPlanOut(BaseModel):
    id: UUID
    user_id: UUID
    week_start_date: date
    created_at: datetime
    entries: List[MealPlanEntryOut] = []

    class Config:
        from_attributes = True
