import os
import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fpdf import FPDF
from app.core.database import get_db
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.models.car import Car
from app.models.maintenance import MaintenanceRecord
from app.models.expense import Expense
from app.models.document import Document
from app.models.reminder import Reminder

router = APIRouter(prefix="/api/v1/export", tags=["export"])

SERVICE_LABELS = {
    "oil_change": "Замена масла", "filter": "Замена фильтра", "spark_plugs": "Свечи",
    "brakes": "Тормоза", "suspension": "Подвеска", "timing_belt": "ГРМ",
    "engine_repair": "Ремонт двигателя", "custom": "Другое",
}

CATEGORY_LABELS = {
    "fuel": "Топливо", "maintenance": "ТО", "repair": "Ремонт", "insurance": "Страховка",
    "tax": "Налог", "parking": "Парковка", "fine": "Штраф", "wash": "Мойка",
    "tires": "Шины", "other": "Прочее",
}

FUEL_LABELS = {"petrol": "Бензин", "diesel": "Дизель", "electric": "Электро", "hybrid": "Гибрид"}
TRANS_LABELS = {"manual": "Механика", "automatic": "Автомат", "cvt": "Вариатор", "robotic": "Робот"}


async def get_user_export_data(user, db):
    cars_result = await db.execute(select(Car).where(Car.user_id == user.id))
    cars = list(cars_result.scalars().all())
    car_ids = [c.id for c in cars]

    maintenance, expenses, documents, reminders = [], [], [], []
    if car_ids:
        m = await db.execute(select(MaintenanceRecord).where(MaintenanceRecord.car_id.in_(car_ids)).order_by(MaintenanceRecord.date.desc()))
        maintenance = [{"id": str(r.id), "car_id": str(r.car_id), "service_type": r.service_type.value if hasattr(r.service_type, 'value') else str(r.service_type), "custom_type": r.custom_type, "date": str(r.date), "mileage": r.mileage, "cost": float(r.cost), "description": r.description, "service_center": r.service_center} for r in m.scalars().all()]

        e = await db.execute(select(Expense).where(Expense.car_id.in_(car_ids)).order_by(Expense.date.desc()))
        expenses = [{"id": str(r.id), "car_id": str(r.car_id), "category": r.category.value if hasattr(r.category, 'value') else str(r.category), "amount": float(r.amount), "date": str(r.date), "description": r.description} for r in e.scalars().all()]

        d = await db.execute(select(Document).where(Document.car_id.in_(car_ids)))
        documents = [{"id": str(r.id), "car_id": str(r.car_id), "name": r.name, "category": r.category.value if hasattr(r.category, 'value') else str(r.category)} for r in d.scalars().all()]

        rem = await db.execute(select(Reminder).where(Reminder.car_id.in_(car_ids)))
        reminders = [{"id": str(r.id), "car_id": str(r.car_id), "title": r.title, "is_completed": r.is_completed} for r in rem.scalars().all()]

    cars_data = []
    for c in cars:
        cars_data.append({
            "id": str(c.id), "brand": c.brand, "model": c.model, "year": c.year,
            "vin": c.vin, "license_plate": c.license_plate,
            "fuel_type": FUEL_LABELS.get(c.fuel_type.value if hasattr(c.fuel_type, 'value') else str(c.fuel_type), str(c.fuel_type)),
            "engine_volume": float(c.engine_volume) if c.engine_volume else None,
            "transmission": TRANS_LABELS.get(c.transmission.value if hasattr(c.transmission, 'value') else str(c.transmission), str(c.transmission)),
            "color": c.color, "mileage": c.mileage,
            "purchase_date": str(c.purchase_date) if c.purchase_date else None,
            "insurance_expiry": str(c.insurance_expiry) if c.insurance_expiry else None,
            "inspection_expiry": str(c.inspection_expiry) if c.inspection_expiry else None,
            "photo_url": c.photo_url,
        })

    return {
        "export_date": datetime.datetime.now().strftime("%d.%m.%Y %H:%M"),
        "user": {"email": user.email, "full_name": user.full_name},
        "cars": cars_data,
        "maintenance": maintenance,
        "expenses": expenses,
        "documents": documents,
        "reminders": reminders,
    }


@router.get("")
async def export_json(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await get_user_export_data(user, db)
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": "attachment; filename=garagebook_export.json"},
    )


class GarageBookPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("DejaVu", "", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", uni=True)
        self.add_font("DejaVu", "B", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", uni=True)

    def header(self):
        self.set_font("DejaVu", "B", 20)
        self.set_text_color(59, 130, 246)
        self.cell(0, 10, "GarageBook", new_x="LMARGIN", new_y="NEXT")
        self.set_font("DejaVu", "", 9)
        self.set_text_color(107, 114, 128)
        self.cell(0, 5, "Отчёт по автомобилю", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(59, 130, 246)
        self.set_line_width(0.5)
        self.line(10, self.get_y() + 2, 200, self.get_y() + 2)
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(156, 163, 175)
        self.cell(0, 10, f"GarageBook | {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title):
        self.set_font("DejaVu", "B", 12)
        self.set_text_color(59, 130, 246)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(229, 231, 235)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def info_row(self, label, value):
        self.set_font("DejaVu", "", 9)
        self.set_text_color(107, 114, 128)
        self.cell(50, 6, label)
        self.set_font("DejaVu", "B", 9)
        self.set_text_color(26, 29, 35)
        self.cell(0, 6, str(value or "—"), new_x="LMARGIN", new_y="NEXT")

    def table_header(self, cols, widths):
        self.set_font("DejaVu", "B", 8)
        self.set_fill_color(241, 243, 245)
        self.set_text_color(107, 114, 128)
        for i, col in enumerate(cols):
            self.cell(widths[i], 7, col, border=0, fill=True)
        self.ln()

    def table_row(self, values, widths):
        self.set_font("DejaVu", "", 8)
        self.set_text_color(26, 29, 35)
        for i, val in enumerate(values):
            self.cell(widths[i], 6, str(val or "—"), border=0)
        self.ln()
        self.set_draw_color(241, 243, 245)
        self.line(10, self.get_y(), 200, self.get_y())


@router.get("/pdf")
async def export_pdf(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await get_user_export_data(user, db)

    pdf = GarageBookPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Date and user
    pdf.set_font("DejaVu", "", 9)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(0, 5, f"Дата: {data['export_date']}  |  Владелец: {data['user']['full_name']}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(5)

    for car in data["cars"]:
        # Car header
        pdf.set_font("DejaVu", "B", 16)
        pdf.set_text_color(26, 29, 35)
        pdf.cell(0, 10, f"{car['brand']} {car['model']} ({car['year']})", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("DejaVu", "", 10)
        pdf.set_text_color(107, 114, 128)
        pdf.cell(0, 6, f"{car['mileage']:,} км  |  {car['fuel_type']}  |  {car['transmission']}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)

        # Car info
        pdf.section_title("Характеристики")
        pdf.info_row("Марка / Модель", f"{car['brand']} {car['model']}")
        pdf.info_row("Год выпуска", car['year'])
        pdf.info_row("Пробег", f"{car['mileage']:,} км")
        pdf.info_row("Топливо", car['fuel_type'])
        pdf.info_row("Двигатель", f"{car['engine_volume']} л" if car['engine_volume'] else "—")
        pdf.info_row("Коробка", car['transmission'])
        if car['vin']:
            pdf.info_row("VIN", car['vin'])
        if car['license_plate']:
            pdf.info_row("Госномер", car['license_plate'])
        if car['color']:
            pdf.info_row("Цвет", car['color'])
        if car['insurance_expiry']:
            pdf.info_row("Страховка до", car['insurance_expiry'])
        if car['inspection_expiry']:
            pdf.info_row("Техосмотр до", car['inspection_expiry'])
        pdf.ln(3)

        # Maintenance
        car_maintenance = [m for m in data["maintenance"] if m["car_id"] == car["id"]]
        if car_maintenance:
            pdf.section_title(f"Обслуживание ({len(car_maintenance)} записей)")
            widths = [22, 45, 25, 40, 30]
            pdf.table_header(["Дата", "Тип работ", "Пробег", "Сервис", "Стоимость"], widths)
            for m in car_maintenance:
                service_name = SERVICE_LABELS.get(m["service_type"], m["service_type"])
                if m["custom_type"]:
                    service_name += f" ({m['custom_type']})"
                pdf.table_row([
                    m["date"], service_name,
                    f"{m['mileage']:,} км", m.get("service_center") or "—",
                    f"{m['cost']:,.0f} ₽"
                ], widths)
            pdf.ln(2)

        # Expenses
        car_expenses = [e for e in data["expenses"] if e["car_id"] == car["id"]]
        if car_expenses:
            pdf.section_title(f"Расходы ({len(car_expenses)} записей)")
            widths = [22, 35, 60, 35]
            pdf.table_header(["Дата", "Категория", "Описание", "Сумма"], widths)
            for e in car_expenses:
                cat_name = CATEGORY_LABELS.get(e["category"], e["category"])
                pdf.table_row([e["date"], cat_name, e.get("description") or "—", f"{e['amount']:,.0f} ₽"], widths)
            pdf.ln(2)

        # Summary
        total_maint = sum(m["cost"] for m in car_maintenance)
        total_exp = sum(e["amount"] for e in car_expenses)
        total = total_maint + total_exp
        if total > 0:
            pdf.section_title("Итого")
            pdf.set_font("DejaVu", "B", 11)
            pdf.set_text_color(59, 130, 246)
            pdf.cell(60, 8, f"Обслуживание: {total_maint:,.0f} ₽")
            pdf.cell(60, 8, f"Расходы: {total_exp:,.0f} ₽")
            pdf.set_text_color(26, 29, 35)
            pdf.cell(0, 8, f"Всего: {total:,.0f} ₽", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(5)

    # Final footer
    pdf.ln(10)
    pdf.set_font("DejaVu", "", 8)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(0, 5, "Отчёт сформирован автоматически сервисом GarageBook", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 5, "Вся информация актуальна на дату формирования отчёта", align="C")

    pdf_bytes = pdf.output()
    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=garagebook_report.pdf"},
    )
