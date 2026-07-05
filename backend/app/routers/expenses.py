from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.car import Car
from app.models.expense import Expense
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseResponse

router = APIRouter(prefix="/api/v1/expenses", tags=["expenses"])


async def _verify_car_ownership(car_id: UUID, user_id: UUID, db) -> bool:
    result = await db.execute(select(Car.id).where(Car.id == car_id, Car.user_id == user_id))
    return result.scalar() is not None


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
        if not await _verify_car_ownership(car_id, user.id, db):
            raise HTTPException(status_code=404, detail="Car not found")
        expenses = await repo.get_car_expenses(car_id, skip=skip, limit=limit)
        total_result = await db.execute(select(func.count(Expense.id)).where(Expense.car_id == car_id))
    else:
        # Get user's car IDs
        cars_result = await db.execute(select(Car.id).where(Car.user_id == user.id))
        car_ids = [r[0] for r in cars_result.all()]
        if not car_ids:
            expenses = []
            total_count = 0
            return {"data": [], "meta": {"page": page, "limit": limit, "total": 0, "total_pages": 1}}
        expenses = await repo.get_all(skip=skip, limit=limit)
        total_result = await db.execute(select(func.count(Expense.id)))

    total_count = total_result.scalar() or 0
    return {"data": [ExpenseResponse.model_validate(e) for e in expenses], "meta": {"page": page, "limit": limit, "total": total_count, "total_pages": max(1, -(-total_count // limit))}}


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    # Verify ownership via car
    if not await _verify_car_ownership(expense.car_id, user.id, db):
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("", response_model=ExpenseResponse)
async def create_expense(data: ExpenseCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify car ownership
    if not await _verify_car_ownership(data.car_id, user.id, db):
        raise HTTPException(status_code=404, detail="Car not found")
    repo = ExpenseRepository(db)
    expense = await repo.create(**data.model_dump())
    return expense


@router.delete("/{expense_id}")
async def delete_expense(expense_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    if not await _verify_car_ownership(expense.car_id, user.id, db):
        raise HTTPException(status_code=404, detail="Expense not found")
    await repo.delete(expense_id)
    return {"message": "Deleted"}
