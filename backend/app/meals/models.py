import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Date
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class MealTemplate(Base):
    __tablename__ = "meal_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    meal_type = Column(String, default="lunch")  # breakfast/lunch/dinner/snack


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    week_start_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MealPlanEntry(Base):
    __tablename__ = "meal_plan_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("meal_plans.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Mon, 6=Sun
    meal_type = Column(String, nullable=False)
    meal_template_id = Column(UUID(as_uuid=True), ForeignKey("meal_templates.id"), nullable=True)
    custom_meal_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
