from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord
from app.models.reminder import Reminder

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get user's cars
    cars_result = await db.execute(select(Car).where(Car.user_id == user.id))
    cars = list(cars_result.scalars().all())
    car_ids = [c.id for c in cars]

    if not car_ids:
        return {
            "next_service": None, "insurance_expiring": None, "inspection_expiring": None,
            "monthly_expenses": 0, "last_record": None, "car_count": 0,
            "recent_activity": [], "upcoming_events": [],
        }

    today = date.today()
    month_start = today.replace(day=1)

    # Monthly expenses
    expenses_result = await db.execute(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.car_id.in_(car_ids), Expense.date >= month_start,
        )
    )
    monthly_expenses = float(expenses_result.scalar() or 0)

    # Recent maintenance (last 5)
    recent_result = await db.execute(
        select(MaintenanceRecord).where(MaintenanceRecord.car_id.in_(car_ids))
        .order_by(MaintenanceRecord.date.desc()).limit(5)
    )
    recent_records = list(recent_result.scalars().all())

    # Next service: last maintenance + estimated interval
    next_service_info = None
    if recent_records:
        last = recent_records[0]
        car = next((c for c in cars if c.id == last.car_id), None)
        if car:
            # Estimate next service in 10000 km or 12 months
            next_mileage = last.mileage + 10000
            next_service_info = {
                "car": f"{car.brand} {car.model}",
                "mileage": next_mileage,
                "type": last.service_type.value,
                "date": str(last.date + timedelta(days=365)),
            }

    # Insurance/inspection expiry
    insurance_info = None
    inspection_info = None
    for car in cars:
        if car.insurance_expiry:
            days_left = (car.insurance_expiry - today).days
            if days_left >= 0:
                insurance_info = {
                    "car": f"{car.brand} {car.model}",
                    "expiry": str(car.insurance_expiry),
                    "days_left": days_left,
                }
        if car.inspection_expiry:
            days_left = (car.inspection_expiry - today).days
            if days_left >= 0:
                inspection_info = {
                    "car": f"{car.brand} {car.model}",
                    "expiry": str(car.inspection_expiry),
                    "days_left": days_left,
                }

    # Upcoming events (reminders + expiring docs)
    upcoming = []
    if insurance_info:
        upcoming.append({
            "title": f"Страховка {insurance_info['car']}",
            "date": insurance_info["expiry"],
            "car": insurance_info["car"],
            "type": "insurance",
        })
    if inspection_info:
        upcoming.append({
            "title": f"Техосмотр {inspection_info['car']}",
            "date": inspection_info["expiry"],
            "car": inspection_info["car"],
            "type": "inspection",
        })

    # Active reminders
    reminders_result = await db.execute(
        select(Reminder).where(Reminder.car_id.in_(car_ids), Reminder.is_completed == False)
        .order_by(Reminder.trigger_date).limit(5)
    )
    for r in reminders_result.scalars().all():
        if r.trigger_date:
            car = next((c for c in cars if c.id == r.car_id), None)
            upcoming.append({
                "title": r.title,
                "date": str(r.trigger_date),
                "car": f"{car.brand} {car.model}" if car else "Авто",
                "type": "reminder",
            })

    # Sort upcoming by date
    upcoming.sort(key=lambda x: x["date"])

    return {
        "next_service": next_service_info,
        "insurance_expiring": insurance_info,
        "inspection_expiring": inspection_info,
        "monthly_expenses": monthly_expenses,
        "last_record": {
            "type": recent_records[0].service_type.value if recent_records else None,
            "car": f"{next((c for c in cars if c.id == recent_records[0].car_id), None).brand} {next((c for c in cars if c.id == recent_records[0].car_id), None).model}" if recent_records else None,
            "date": str(recent_records[0].date) if recent_records else None,
        } if recent_records else None,
        "car_count": len(cars),
        "recent_activity": [
            {
                "id": str(r.id),
                "type": "maintenance",
                "service_type": r.service_type.value,
                "date": str(r.date),
                "car": f"{next((c for c in cars if c.id == r.car_id), None).brand} {next((c for c in cars if c.id == r.car_id), None).model}" if next((c for c in cars if c.id == r.car_id), None) else "Авто",
            }
            for r in recent_records
        ],
        "upcoming_events": upcoming,
    }


# Need to import Expense
from app.models.expense import Expense
