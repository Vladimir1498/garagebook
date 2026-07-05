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


def _escape_like(value: str) -> str:
    """Escape special characters for SQL LIKE to prevent pattern injection."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


# Маппинг русских названий на enum values
SERVICE_TYPE_LABELS = {
    "oil_change": "замена масла",
    "filter": "фильтр",
    "spark_plugs": "свечи",
    "brakes": "тормоза",
    "suspension": "подвеска",
    "timing_belt": "грм",
    "engine_repair": "двигатель",
    "custom": "другое",
}

# Обратный маппинг для поиска по русскому названию
SERVICE_TYPE_KEYWORDS = {
    "замена масла": "oil_change",
    "масло": "oil_change",
    "фильтр": "filter",
    "свечи": "spark_plugs",
    "тормоза": "brakes",
    "подвеска": "suspension",
    "грм": "timing_belt",
    "двигатель": "engine_repair",
    "ремонт двигателя": "engine_repair",
}

EXPENSE_CATEGORY_LABELS = {
    "fuel": "топливо",
    "maintenance": "обслуживание",
    "repair": "ремонт",
    "insurance": "страховка",
    "tax": "налог",
    "parking": "парковка",
    "fine": "штраф",
    "wash": "мойка",
    "tires": "шины",
    "other": "прочее",
}


@router.get("")
async def search(
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    results = {"cars": [], "maintenance": [], "expenses": [], "documents": []}
    escaped = _escape_like(q)
    query = f"%{escaped}%"
    query_lower = q.lower()

    # Определяем все service_type ключи, подходящие под запрос
    matching_service_types = []
    for key, label in SERVICE_TYPE_LABELS.items():
        if query_lower in label.lower() or query_lower in key:
            matching_service_types.append(key)
    for keyword, enum_val in SERVICE_TYPE_KEYWORDS.items():
        if query_lower in keyword.lower() and enum_val not in matching_service_types:
            matching_service_types.append(enum_val)

    # Определяем все expense категории, подходящие под запрос
    matching_expense_cats = []
    for key, label in EXPENSE_CATEGORY_LABELS.items():
        if query_lower in label.lower() or query_lower in key:
            matching_expense_cats.append(key)

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

    # Get user's car IDs for maintenance/expenses/documents
    car_ids_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
    car_ids = [r[0] for r in car_ids_result.all()]

    if car_ids:
        # Search maintenance records - по описанию, типу работ, сервисному центру, custom_type
        maint_conditions = [
            MaintenanceRecord.description.ilike(query),
            MaintenanceRecord.service_center.ilike(query),
            MaintenanceRecord.custom_type.ilike(query),
        ]
        # Добавляем поиск по enum values и русским названиям
        for st in matching_service_types:
            maint_conditions.append(MaintenanceRecord.service_type == st)

        maint_result = await db.execute(
            select(MaintenanceRecord).where(
                MaintenanceRecord.car_id.in_(car_ids),
                or_(*maint_conditions)
            ).limit(10)
        )
        results["maintenance"] = [
            {
                "id": str(m.id),
                "car_id": str(m.car_id),
                "service_type": m.service_type.value,
                "service_type_label": SERVICE_TYPE_LABELS.get(m.service_type.value, m.service_type.value),
                "description": m.description,
                "service_center": m.service_center,
                "date": str(m.date),
                "cost": float(m.cost),
                "type": "maintenance",
            }
            for m in maint_result.scalars().all()
        ]

        # Search expenses - по описанию, категории
        exp_conditions = [
            Expense.description.ilike(query),
            Expense.category.ilike(query),
        ]
        for cat in matching_expense_cats:
            exp_conditions.append(Expense.category == cat)

        exp_result = await db.execute(
            select(Expense).where(
                Expense.car_id.in_(car_ids),
                or_(*exp_conditions)
            ).limit(10)
        )
        results["expenses"] = [
            {
                "id": str(e.id),
                "car_id": str(e.car_id),
                "category": e.category.value,
                "category_label": EXPENSE_CATEGORY_LABELS.get(e.category.value, e.category.value),
                "description": e.description,
                "amount": float(e.amount),
                "date": str(e.date),
                "type": "expense",
            }
            for e in exp_result.scalars().all()
        ]

        # Search documents - по названию, заметкам
        doc_result = await db.execute(
            select(Document).where(
                Document.car_id.in_(car_ids),
                or_(
                    Document.name.ilike(query),
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
