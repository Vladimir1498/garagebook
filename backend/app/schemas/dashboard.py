from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal


class PaginatedResponse(BaseModel):
    data: list
    meta: dict


class DashboardResponse(BaseModel):
    next_service: dict | None = None
    insurance_expiring: dict | None = None
    inspection_expiring: dict | None = None
    monthly_expenses: float = 0
    last_record: dict | None = None
    car_count: int = 0
    recent_activity: list[dict] = []
    upcoming_events: list[dict] = []


class CategoryBreakdown(BaseModel):
    category: str
    total: float
    count: int


class MonthlyExpense(BaseModel):
    month: str
    total: float


class AnalyticsResponse(BaseModel):
    monthly_expenses: list[MonthlyExpense] = []
    yearly_expenses: list[MonthlyExpense] = []
    category_breakdown: list[CategoryBreakdown] = []
    cost_per_km: float = 0
    total_expenses: float = 0
    avg_service_cost: float = 0
    most_expensive_repair: dict | None = None
    ownership_cost: float = 0
