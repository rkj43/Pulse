import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    goal_type = Column(String, nullable=True)
    target_value = Column(Float, nullable=True)
    current_value = Column(Float, default=0)
    unit = Column(String, nullable=True)
    target_date = Column(DateTime, nullable=True)
    status = Column(String, default="active")  # active/completed/abandoned
    created_at = Column(DateTime, default=datetime.utcnow)
