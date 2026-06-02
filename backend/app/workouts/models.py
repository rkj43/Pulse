import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    muscle_group = Column(String, nullable=True)
    equipment = Column(String, nullable=True)


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    day_of_week = Column(Integer, nullable=True)  # 0=Mon, 6=Sun


class WorkoutTemplateExercise(Base):
    __tablename__ = "workout_template_exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("workout_templates.id"), nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    sets = Column(Integer, default=3)
    reps = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    order = Column(Integer, default=0)


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("workout_templates.id"), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)


class WorkoutSessionLog(Base):
    __tablename__ = "workout_session_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("workout_sessions.id"), nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    set_number = Column(Integer, default=1)
    weight_kg = Column(Float, nullable=True)
    reps = Column(Integer, nullable=True)
    completed = Column(Boolean, default=True)


class WeeklySchedule(Base):
    __tablename__ = "weekly_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Mon, 6=Sun
    template_id = Column(UUID(as_uuid=True), ForeignKey("workout_templates.id"), nullable=True)
