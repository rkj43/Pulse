from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class InsightOut(BaseModel):
    id: UUID
    user_id: UUID
    created_at: datetime
    title: str
    description: Optional[str]
    category: Optional[str]
    data_json: Optional[str]

    class Config:
        from_attributes = True
