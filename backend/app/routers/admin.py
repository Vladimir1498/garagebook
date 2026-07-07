from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_current_admin
from app.core.database import get_db
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord
from app.models.expense import Expense
from app.models.subscription import Subscription, SubscriptionTier

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = {
        "user_count": 0,
        "car_count": 0,
        "maintenance_count": 0,
        "total_revenue": 0,
        "tiers": {},
        "registrations": [],
        "revenue": [],
        "top_users": [],
    }

    try:
        result["user_count"] = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    except Exception:
        pass

    try:
        result["car_count"] = (await db.execute(select(func.count()).select_from(Car))).scalar() or 0
    except Exception:
        pass

    try:
        result["maintenance_count"] = (await db.execute(select(func.count()).select_from(MaintenanceRecord))).scalar() or 0
    except Exception:
        pass

    try:
        r = await db.execute(select(func.coalesce(func.sum(Expense.amount), 0)))
        result["total_revenue"] = float(r.scalar() or 0)
    except Exception:
        pass

    # Subscriptions by tier
    try:
        tier_result = await db.execute(
            select(Subscription.tier, func.count()).group_by(Subscription.tier)
        )
        result["tiers"] = {str(row[0].value): row[1] for row in tier_result.all()}
    except Exception:
        pass

    # Registrations last 30 days
    try:
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        reg_result = await db.execute(
            select(func.date(User.created_at), func.count())
            .where(User.created_at >= thirty_days_ago)
            .group_by(func.date(User.created_at))
            .order_by(func.date(User.created_at))
        )
        result["registrations"] = [{"date": str(r[0]), "count": r[1]} for r in reg_result.all()]
    except Exception:
        pass

    # Revenue last 12 months (use created_at which is DateTime)
    try:
        twelve_months_ago = datetime.utcnow() - timedelta(days=365)
        rev_result = await db.execute(
            select(
                func.date_trunc('month', Expense.created_at),
                func.coalesce(func.sum(Expense.amount), 0)
            )
            .where(Expense.created_at >= twelve_months_ago)
            .group_by(func.date_trunc('month', Expense.created_at))
            .order_by(func.date_trunc('month', Expense.created_at))
        )
        result["revenue"] = [
            {"month": str(r[0].date()) if r[0] else "未知", "total": float(r[1])}
            for r in rev_result.all()
        ]
    except Exception:
        pass

    # Top 5 active users
    try:
        top_result = await db.execute(
            select(User.full_name, User.email, func.count(Car.id).label("car_count"))
            .join(Car, Car.user_id == User.id, isouter=True)
            .group_by(User.id, User.full_name, User.email)
            .order_by(func.count(Car.id).desc())
            .limit(5)
        )
        result["top_users"] = [
            {"name": r[0], "email": r[1], "cars": r[2]}
            for r in top_result.all()
        ]
    except Exception:
        pass

    return result


# ── Users ──────────────────────────────────────────────

@router.get("/users")
async def list_users(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    out = []
    for u in users:
        sub_result = await db.execute(select(Subscription).where(Subscription.user_id == u.id))
        sub = sub_result.scalar_one_or_none()
        out.append({
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "created_at": str(u.created_at),
            "tier": str(sub.tier.value) if sub and sub.tier else "free",
        })
    return out


@router.post("/users/{user_id}/toggle-admin")
async def toggle_admin(user_id: str, user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot change own admin status")
    target.is_admin = not target.is_admin
    await db.commit()
    return {"is_admin": target.is_admin}


@router.post("/users/{user_id}/toggle-active")
async def toggle_active(user_id: str, user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")
    target.is_active = not target.is_active
    await db.commit()
    return {"is_active": target.is_active}


@router.post("/users/{user_id}/set-tier")
async def set_tier(user_id: str, body: dict, user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    tier_str = body.get("tier", "free")
    if tier_str not in ("free", "pro", "fleet"):
        raise HTTPException(status_code=400, detail="Invalid tier")

    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    tier = SubscriptionTier(tier_str)
    sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub = sub_result.scalar_one_or_none()
    if sub:
        sub.tier = tier
    else:
        sub = Subscription(user_id=user_id, tier=tier)
        db.add(sub)
    await db.commit()
    return {"tier": tier_str}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    await db.delete(target)
    await db.commit()
    return {"message": "Deleted"}


# ── Cars ───────────────────────────────────────────────

@router.get("/cars")
async def list_all_cars(user=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Car).order_by(Car.created_at.desc()))
    cars = result.scalars().all()
    return [
        {"id": str(c.id), "brand": c.brand, "model": c.model, "year": c.year, "mileage": c.mileage, "user_id": str(c.user_id)}
        for c in cars
    ]
