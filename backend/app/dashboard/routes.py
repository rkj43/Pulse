from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import get_db
from app.dashboard.service import get_today_dashboard

router = APIRouter()


@router.get("/today")
def today(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = get_today_dashboard(db, current_user.id)
    # Serialize ORM objects to dicts
    return {
        "date": data["date"],
        "habits": [
            {
                "id": str(h.id), "name": h.name, "description": h.description,
                "target_frequency": h.target_frequency, "frequency_unit": h.frequency_unit, "active": h.active
            }
            for h in data["habits"]
        ],
        "streaks": [
            {
                "id": str(s.id), "entity_type": s.entity_type, "entity_id": str(s.entity_id),
                "current_streak": s.current_streak, "best_streak": s.best_streak,
                "last_completed": s.last_completed.isoformat() if s.last_completed else None
            }
            for s in data["streaks"]
        ],
        "health_summary": data["health_summary"],
        "goals": [
            {
                "id": str(g.id), "title": g.title, "status": g.status,
                "target_value": g.target_value, "current_value": g.current_value, "unit": g.unit
            }
            for g in data["goals"]
        ],
        "today_schedule": {
            "template_id": str(data["today_schedule"].template_id) if data["today_schedule"] and data["today_schedule"].template_id else None,
            "day_of_week": data["today_schedule"].day_of_week if data["today_schedule"] else None,
        } if data["today_schedule"] else None,
        "today_sessions": [
            {"id": str(s.id), "completed": s.completed, "duration_minutes": s.duration_minutes}
            for s in data["today_sessions"]
        ],
    }
