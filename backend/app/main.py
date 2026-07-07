import os
import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from app.core.config import settings
from app.core.database import engine, async_session
from app.models import Base
from app.models.reminder import Reminder
from app.models.car import Car
from app.routers import auth, users, cars, maintenance, expenses, documents, reminders, dashboard, analytics, admin, ai, obd, fleets, payments, public, notifications, push, export, search

logger = logging.getLogger(__name__)


async def _check_reminders():
    """Background task: check for due reminders and send push notifications."""
    while True:
        try:
            await asyncio.sleep(3600)  # every hour
            async with async_session() as db:
                today = date.today()
                result = await db.execute(
                    select(Reminder)
                    .join(Car, Reminder.car_id == Car.id)
                    .where(
                        Reminder.is_completed == False,
                        Reminder.notify_push == True,
                        Reminder.trigger_date != None,
                        Reminder.trigger_date <= today,
                    )
                )
                due_reminders = result.scalars().all()

                if due_reminders:
                    from app.services.push_service import send_push_to_user
                    for reminder in due_reminders:
                        car_result = await db.execute(select(Car).where(Car.id == reminder.car_id))
                        car = car_result.scalar_one_or_none()
                        if car:
                            await send_push_to_user(
                                user_id=car.user_id,
                                title=reminder.title,
                                body=f"{car.brand} {car.model} — пора!",
                                url="/reminders",
                                db=db,
                            )
                            # Mark as completed to avoid re-sending
                            reminder.is_completed = True
                    await db.commit()
                    logger.info(f"Push sent for {len(due_reminders)} due reminders")
        except Exception as e:
            logger.error(f"Reminder check failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Start background reminder checker
    task = asyncio.create_task(_check_reminders())

    yield

    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="GarageBook API",
    description="Digital garage for car owners",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log validation errors
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"422 VALIDATION ERROR: {request.method} {request.url.path} -> {exc.errors()}")
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

for router in [auth, users, cars, maintenance, expenses, documents, reminders, dashboard, analytics, admin, ai, obd, fleets, payments, public, notifications, push, export, search]:
    app.include_router(router.router)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health():
    return {"status": "ok"}
