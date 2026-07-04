from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
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
        expenses = await repo.get_car_expenses(car_id, skip=skip, limit=limit)
    else:
        expenses = await repo.get_all(skip=skip, limit=limit)
    return {"data": [ExpenseResponse.model_validate(e) for e in expenses], "meta": {"page": page, "limit": limit, "total": len(expenses), "total_pages": 1}}


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    expense = await repo.get(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("", response_model=ExpenseResponse)
async def create_expense(data: ExpenseCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    expense = await repo.create(**data.model_dump())
    return expense


@router.delete("/{expense_id}")
async def delete_expense(expense_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = ExpenseRepository(db)
    if not await repo.delete(expense_id):
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Deleted"}
