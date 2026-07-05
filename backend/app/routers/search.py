from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord, ServiceType
from app.models.expense import Expense
from app.models.document import Document

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("")
async def search(
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    results = {"cars": [], "maintenance": [], "expenses": [], "documents": []}
    query = f"%{q}%"

    # Search cars
    car_result = await db.execute(
        select(Car).where(
            Car.user_id == user.id,
            or_(
                Car.brand.ilike(query),
                Car.model.ilike(query),
                Car.vin.ilike(query),
                Car.license_plate.ilike(query),
                Car.color.ilike(query),
            )
        ).limit(10)
    )
    results["cars"] = [
        {
            "id": str(c.id),
            "brand": c.brand,
            "model": c.model,
            "year": c.year,
            "vin": c.vin,
            "license_plate": c.license_plate,
            "color": c.color,
            "type": "car",
        }
        for c in car_result.scalars().all()
    ]

    # Search maintenance records
    car_ids_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
    car_ids = [r[0] for r in car_ids_result.all()]

    if car_ids:
        maint_result = await db.execute(
            select(MaintenanceRecord).where(
                MaintenanceRecord.car_id.in_(car_ids),
                or_(
                    MaintenanceRecord.description.ilike(query),
                    MaintenanceRecord.service_center.ilike(query),
                    MaintenanceRecord.custom_type.ilike(query),
                )
            ).limit(10)
        )
        results["maintenance"] = [
            {
                "id": str(m.id),
                "car_id": str(m.car_id),
                "service_type": m.service_type.value,
                "description": m.description,
                "date": str(m.date),
                "cost": float(m.cost),
                "type": "maintenance",
            }
            for m in maint_result.scalars().all()
        ]

        # Search expenses
        exp_result = await db.execute(
            select(Expense).where(
                Expense.car_id.in_(car_ids),
                or_(
                    Expense.description.ilike(query),
                    Expense.category.ilike(query),
                )
            ).limit(10)
        )
        results["expenses"] = [
            {
                "id": str(e.id),
                "car_id": str(e.car_id),
                "category": e.category.value,
                "description": e.description,
                "amount": float(e.amount),
                "date": str(e.date),
                "type": "expense",
            }
            for e in exp_result.scalars().all()
        ]

        # Search documents
        doc_result = await db.execute(
            select(Document).where(
                Document.car_id.in_(car_ids),
                or_(
                    Document.name.ilike(query),
                    Document.description.ilike(query),
                    Document.notes.ilike(query),
                )
            ).limit(10)
        )
        results["documents"] = [
            {
                "id": str(d.id),
                "car_id": str(d.car_id),
                "name": d.name,
                "description": d.description,
                "type": "document",
            }
            for d in doc_result.scalars().all()
        ]

    return results
