from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.deps import get_current_user
from app.models.user import User
from app.services.ocr_service import scan_receipt, scan_vin

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/scan-receipt")
async def scan_receipt_endpoint(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """Scan a receipt image and extract amount, date, vendor, category."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    result = await scan_receipt(contents, file.content_type or "image/jpeg")
    return result


@router.post("/scan-vin")
async def scan_vin_endpoint(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """Scan VIN number from a photo."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    result = await scan_vin(contents)
    return result
