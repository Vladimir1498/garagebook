from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_car_owner
from app.models.user import User
from app.models.car import Car
from app.models.expense import Expense
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseResponse

router = APIRouter(prefix="/api/v1/expenses", tags=["expenses"])


@router.get("")
async def list_expenses(
    car_id: UUID | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ExpenseRepository(db)
    skip = (page - 1) * limit
    if car_id:
        await require_car_owner(car_id, user.id, db)
        expenses = await repo.get_car_expenses(car_id, skip=skip, limit=limit)
        total_result = await db.execute(select(func.count(Expense.id)).where(Expense.car_id == car_id))
    else:
        # Get user's car IDs
        cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
        car_ids = [r[0] for r in cars_result.all()]
        if not car_ids:
            return {"data": [], "meta": {"page": page, "limit": limit, "total": 0, "total_pages": 1}}
        expenses_result = await db.execute(
            select(Expense).where(Expense.car_id.in_(car_ids)).offset(skip).limit(limit)
        )
        expenses = list(expenses_result.scalars().all())
        total_result = await db.execute(select(func.count(Expense.id)).where(Expense.car_id.in_(car_ids)))

    total_count = total_result.scalar() or 0
    return {"data": [ExpenseResponse.model_validate(e) for e in expenses], "meta": {"page": page, "limit": limit, "total": total_count, "total_pages": max(1, -(-total_count // limit))}}


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await require_car_owner(expense.car_id, user.id, db)
    return expense


@router.post("", response_model=ExpenseResponse)
async def create_expense(data: ExpenseCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await require_car_owner(data.car_id, user.id, db)
    repo = ExpenseRepository(db)
    expense = await repo.create(**data.model_dump())
    return expense


@router.delete("/{expense_id}")
async def delete_expense(expense_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    await require_car_owner(expense.car_id, user.id, db)
    await repo.delete(expense_id)
    return {"message": "Deleted"}
