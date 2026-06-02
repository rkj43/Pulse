from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.goals.models import Goal


def get_goals(db: Session, user_id: UUID) -> List[Goal]:
    return db.query(Goal).filter(Goal.user_id == user_id).all()


def get_goal(db: Session, goal_id: UUID, user_id: UUID) -> Optional[Goal]:
    return db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()


def create_goal(db: Session, user_id: UUID, **kwargs) -> Goal:
    goal = Goal(user_id=user_id, **kwargs)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_goal(db: Session, goal: Goal, **kwargs) -> Goal:
    for k, v in kwargs.items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)
    return goal


def delete_goal(db: Session, goal: Goal):
    db.delete(goal)
    db.commit()
