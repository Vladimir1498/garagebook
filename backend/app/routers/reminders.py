from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_car_owner, verify_car_ownership
from app.models.user import User
from app.models.car import Car
from app.models.reminder import Reminder
from app.models.notification import Notification, NotificationType
from app.repositories.reminder_repository import ReminderRepository
from app.schemas.reminder import ReminderCreate, ReminderResponse
from app.services.push_service import send_push_to_user

router = APIRouter(prefix="/api/v1/reminders", tags=["reminders"])


async def _get_reminder_with_ownership(reminder_id: UUID, user_id: UUID, db) -> Reminder | None:
    """Get a reminder only if it belongs to a car owned by the user."""
    result = await db.execute(
        select(Reminder).join(Car, Reminder.car_id == Car.id)
        .where(Reminder.id == reminder_id, Car.user_id == user_id)
    )
    return result.scalar_one_or_none()


@router.get("")
async def list_reminders(
    car_id: UUID | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        repo = ReminderRepository(db)
        if car_id:
            if not await verify_car_ownership(car_id, user.id, db):
                return {"data": [], "meta": {"page": 1, "limit": 100, "total": 0, "total_pages": 1}}
            reminders = await repo.get_car_reminders(car_id)
        else:
            cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
            car_ids = [r[0] for r in cars_result.all()]
            if not car_ids:
                reminders = []
            else:
                result = await db.execute(select(Reminder).where(Reminder.car_id.in_(car_ids)))
                reminders = list(result.scalars().all())
        return {"data": [ReminderResponse.model_validate(r) for r in reminders], "meta": {"page": 1, "limit": 100, "total": len(reminders), "total_pages": 1}}
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"list_reminders error: {e}")
        return {"data": [], "meta": {"page": 1, "limit": 100, "total": 0, "total_pages": 1}}


@router.post("", response_model=ReminderResponse)
async def create_reminder(data: ReminderCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await require_car_owner(data.car_id, user.id, db)

    repo = ReminderRepository(db)
    reminder = await repo.create(**data.model_dump())

    # Create in-app notification
    notification = Notification(
        user_id=user.id,
        title="Новое напоминание",
        body=data.title,
        type=NotificationType.reminder,
        link="/reminders",
    )
    db.add(notification)
    await db.commit()

    # Send push notification
    try:
        await send_push_to_user(
            user_id=user.id,
            title="Напоминание создано",
            body=data.title,
            url="/reminders",
            db=db,
        )
    except Exception:
        pass  # Push is best-effort

    return reminder


@router.post("/{reminder_id}/complete", response_model=ReminderResponse)
async def complete_reminder(reminder_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ReminderRepository(db)
    reminder = await _get_reminder_with_ownership(reminder_id, user.id, db)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    updated = await repo.update(reminder_id, is_completed=True)
    return updated


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ReminderRepository(db)
    reminder = await _get_reminder_with_ownership(reminder_id, user.id, db)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    await repo.delete(reminder_id)
    return {"message": "Deleted"}
