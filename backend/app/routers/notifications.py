from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc())
    )
    return [NotificationResponse(n) for n in result.scalars().all()]


@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Notification).where(Notification.id == notification_id, Notification.user_id == user.id).values(is_read=True)
    )
    await db.commit()
    return {"message": "Marked as read"}


@router.post("/read-all")
async def mark_all_as_read(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Notification).where(Notification.user_id == user.id, Notification.is_read == False).values(is_read=True)
    )
    await db.commit()
    return {"message": "All marked as read"}


@router.delete("")
async def delete_all_notifications(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Delete all notifications for the current user."""
    result = await db.execute(delete(Notification).where(Notification.user_id == user.id))
    await db.commit()
    return {"message": "All notifications deleted", "count": result.rowcount}


def NotificationResponse(n):
    return {
        "id": n.id,
        "user_id": n.user_id,
        "title": n.title,
        "body": n.body,
        "type": n.type,
        "is_read": n.is_read,
        "link": n.link,
        "created_at": str(n.created_at) if n.created_at else None,
    }
