from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.health import repository
from app.health.schemas import HealthMetricCreate, HealthMetricOut

router = APIRouter()


@router.get("/metrics", response_model=List[HealthMetricOut])
def get_metrics(
    metric_type: Optional[str] = Query(None),
    days: int = Query(30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return repository.get_metrics(db, current_user.id, metric_type, days)


@router.post("/metrics", response_model=HealthMetricOut)
def create_metric(data: HealthMetricCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.create_metric(db, current_user.id, **data.model_dump(exclude_none=False))


@router.get("/summary/today")
def today_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return repository.get_today_summary(db, current_user.id)
