import os
import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
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

                # Use raw SQL to avoid enum comparison issues
                result = await db.execute(
                    text("""
                        SELECT r.id, r.title, r.car_id, c.user_id, c.brand, c.model
                        FROM reminders r
                        JOIN cars c ON r.car_id = c.id
                        WHERE r.is_completed = false
                          AND r.notify_push = true
                          AND r.trigger_date IS NOT NULL
                          AND r.trigger_date <= :today
                    """),
                    {"today": today}
                )
                due_reminders = result.fetchall()

                if due_reminders:
                    from app.services.push_service import send_push_to_user
                    sent_count = 0
                    for row in due_reminders:
                        try:
                            await send_push_to_user(
                                user_id=row.user_id,
                                title=row.title,
                                body=f"{row.brand} {row.model} — пора!",
                                url="/reminders",
                                db=db,
                            )
                            # Mark as completed
                            await db.execute(
                                text("UPDATE reminders SET is_completed = true WHERE id = :id"),
                                {"id": row.id}
                            )
                            sent_count += 1
                        except Exception as e:
                            logger.warning(f"Push failed for reminder {row.id}: {e}")

                    await db.commit()
                    logger.info(f"Push sent for {sent_count}/{len(due_reminders)} due reminders")
                else:
                    logger.debug("No due reminders found")
        except Exception as e:
            logger.error(f"Reminder check failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Start background reminder checker
    task = asyncio.create_task(_check_reminders())
    logger.info("Background reminder checker started")

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
