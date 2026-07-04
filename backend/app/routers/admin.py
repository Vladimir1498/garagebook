from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_current_admin
from app.core.database import get_db
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord
from app.models.expense import Expense

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    user_count = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    car_count = (await db.execute(select(func.count()).select_from(Car))).scalar() or 0
    maintenance_count = (await db.execute(select(func.count()).select_from(MaintenanceRecord))).scalar() or 0
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Expense.amount), 0)))).scalar() or 0

    return {
        "user_count": user_count,
        "car_count": car_count,
        "maintenance_count": maintenance_count,
        "total_revenue": float(total_revenue),
    }


@router.get("/users")
async def list_users(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {"id": str(u.id), "email": u.email, "full_name": u.full_name, "is_admin": u.is_admin, "is_active": u.is_active, "created_at": str(u.created_at)}
        for u in users
    ]


@router.get("/cars")
async def list_all_cars(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Car).order_by(Car.created_at.desc()))
    cars = result.scalars().all()
    return [
        {"id": str(c.id), "brand": c.brand, "model": c.model, "year": c.year, "mileage": c.mileage, "user_id": str(c.user_id)}
        for c in cars
    ]
