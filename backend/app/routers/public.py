from uuid import UUID
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/public", tags=["public"])


@router.get("/vehicles/{vehicle_id}")
async def get_public_vehicle(vehicle_id: UUID):
    # TODO: fetch vehicle from DB (no auth required)
    return {
        "id": vehicle_id,
        "brand": "Toyota",
        "model": "Camry",
        "year": 2020,
        "fuel_type": "petrol",
        "mileage": 50000,
        "engine_volume": 2.5,
    }


@router.get("/vehicles/{vehicle_id}/history")
async def get_public_history(vehicle_id: UUID):
    # TODO: fetch maintenance history
    return []
