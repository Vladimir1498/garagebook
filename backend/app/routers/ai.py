from fastapi import APIRouter, Depends, UploadFile, File
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/scan-receipt")
async def scan_receipt(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    # TODO: implement OCR with Tesseract/GPT-4 Vision
    return {
        "date": None,
        "amount": None,
        "vendor": None,
        "service_type": None,
        "items": [],
    }


@router.post("/scan-vin")
async def scan_vin(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    # TODO: implement VIN OCR
    return {
        "vin": None,
        "brand": None,
        "model": None,
        "year": None,
    }
