from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, cast, String, text
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.tiers import require_tier
from app.models.subscription import SubscriptionTier
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord
from app.models.expense import Expense

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("")
async def get_analytics(
    car_id: UUID | None = None,
    period: str = Query("year"),
    user: User = Depends(get_current_user),
    sub=Depends(require_tier(SubscriptionTier.pro)),
    db: AsyncSession = Depends(get_db),
):
    if car_id:
        car_ids = [car_id]
    else:
        cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
        car_ids = [r[0] for r in cars_result.all()]

    if not car_ids:
        return {
            "monthly_expenses": [], "yearly_expenses": [], "category_breakdown": [],
            "cost_per_km": 0, "total_expenses": 0, "avg_service_cost": 0,
            "most_expensive_repair": None, "ownership_cost": 0,
        }

    today = date.today()

    # Total expenses
    total_result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.car_id.in_(car_ids))
    )
    total_expenses = float(total_result.scalar() or 0)

    # Category breakdown
    cat_result = await db.execute(
        select(
            cast(Expense.category, String).label('cat'),
            func.sum(Expense.amount).label('total'),
            func.count().label('count'),
        ).where(Expense.car_id.in_(car_ids))
        .group_by(cast(Expense.category, String))
    )
    category_breakdown = [{"category": r.cat, "total": float(r.total), "count": r.count} for r in cat_result]

    # Monthly expenses - use raw SQL to avoid GROUP BY issues
    month_start = today.replace(day=1)
    monthly_result = await db.execute(
        text("""
            SELECT to_char(date, 'YYYY-MM') as month, sum(amount) as total
            FROM expenses
            WHERE car_id = ANY(:car_ids) AND date >= :month_start
            GROUP BY to_char(date, 'YYYY-MM')
            ORDER BY month
        """),
        {"car_ids": [str(cid) for cid in car_ids], "month_start": month_start}
    )
    monthly_expenses = [{"month": r.month, "total": float(r.total)} for r in monthly_result]

    # Maintenance stats
    maint_result = await db.execute(
        select(func.coalesce(func.sum(MaintenanceRecord.cost), 0), func.count())
        .where(MaintenanceRecord.car_id.in_(car_ids))
    )
    maint_row = maint_result.one()
    total_maintenance = float(maint_row[0] or 0)
    maintenance_count = int(maint_row[1] or 0)
    avg_service_cost = total_maintenance / max(maintenance_count, 1)

    # Most expensive repair
    expensive_result = await db.execute(
        select(MaintenanceRecord).where(MaintenanceRecord.car_id.in_(car_ids))
        .order_by(MaintenanceRecord.cost.desc()).limit(1)
    )
    expensive = expensive_result.scalar_one_or_none()
    most_expensive = None
    if expensive:
        most_expensive = {"description": expensive.service_type.value, "cost": float(expensive.cost), "date": str(expensive.date)}

    # Cost per km
    cars_result = await db.execute(select(Car).where(Car.id.in_(car_ids)))
    cars = list(cars_result.scalars().all())
    total_mileage = sum(c.mileage for c in cars) or 1
    cost_per_km = total_expenses / total_mileage

    return {
        "monthly_expenses": monthly_expenses,
        "yearly_expenses": [],
        "category_breakdown": category_breakdown,
        "cost_per_km": round(cost_per_km, 2),
        "total_expenses": total_expenses,
        "avg_service_cost": round(avg_service_cost, 2),
        "most_expensive_repair": most_expensive,
        "ownership_cost": total_expenses,
    }
