from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.auth.routes import router as auth_router
from app.dashboard.routes import router as dashboard_router
from app.habits.routes import router as habits_router
from app.reminders.routes import router as reminders_router
from app.workouts.routes import router as workouts_router
from app.meals.routes import router as meals_router
from app.health.routes import router as health_router
from app.goals.routes import router as goals_router
from app.analytics.routes import router as analytics_router
from app.scheduler.jobs import start_scheduler

app = FastAPI(title="Pulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(habits_router, prefix="/api/habits", tags=["habits"])
app.include_router(reminders_router, prefix="/api/reminders", tags=["reminders"])
app.include_router(workouts_router, prefix="/api/workouts", tags=["workouts"])
app.include_router(meals_router, prefix="/api/meals", tags=["meals"])
app.include_router(health_router, prefix="/api/health", tags=["health"])
app.include_router(goals_router, prefix="/api/goals", tags=["goals"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    start_scheduler()


@app.get("/api/health-check")
def health_check():
    return {"status": "ok"}
