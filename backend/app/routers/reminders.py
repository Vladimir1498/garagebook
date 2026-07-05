from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.repositories.reminder_repository import ReminderRepository
from app.schemas.reminder import ReminderCreate, ReminderResponse

router = APIRouter(prefix="/api/v1/reminders", tags=["reminders"])


@router.get("")
async def list_reminders(
    car_id: UUID | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ReminderRepository(db)
    if car_id:
        reminders = await repo.get_car_reminders(car_id)
    else:
        reminders = await repo.get_all()
    return {"data": [ReminderResponse.model_validate(r) for r in reminders], "meta": {"page": 1, "limit": 100, "total": len(reminders), "total_pages": 1}}


@router.post("", response_model=ReminderResponse)
async def create_reminder(data: ReminderCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ReminderRepository(db)
    reminder = await repo.create(**data.model_dump())

    # Create in-app notification
    notification = Notification(
        user_id=user.id,
        title="Новое напоминание",
        body=data.title,
        type=NotificationType.reminder,
        link=f"/reminders",
    )
    db.add(notification)
    await db.commit()

    return reminder


@router.post("/{reminder_id}/complete", response_model=ReminderResponse)
async def complete_reminder(reminder_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ReminderRepository(db)
    reminder = await repo.update(reminder_id, is_completed=True)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return reminder


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ReminderRepository(db)
    if not await repo.delete(reminder_id):
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Deleted"}
