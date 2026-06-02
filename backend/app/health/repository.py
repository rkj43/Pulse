from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.health.models import HealthMetric


def create_metric(db: Session, user_id: UUID, **kwargs) -> HealthMetric:
    metric = HealthMetric(user_id=user_id, **kwargs)
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


def get_metrics(db: Session, user_id: UUID, metric_type: Optional[str] = None, days: int = 30) -> List[HealthMetric]:
    start = datetime.utcnow() - timedelta(days=days)
    query = db.query(HealthMetric).filter(
        HealthMetric.user_id == user_id,
        HealthMetric.date >= start,
    )
    if metric_type:
        query = query.filter(HealthMetric.metric_type == metric_type)
    return query.order_by(HealthMetric.date.desc()).all()


def get_today_summary(db: Session, user_id: UUID) -> dict:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    metrics = db.query(HealthMetric).filter(
        HealthMetric.user_id == user_id,
        HealthMetric.date >= today_start,
    ).all()
    summary = {}
    for m in metrics:
        summary[m.metric_type] = m.value
    return summary
