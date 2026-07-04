from fastapi import APIRouter, Depends, WebSocket
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/obd", tags=["obd"])


@router.post("/connect")
async def connect_obd(user: User = Depends(get_current_user)):
    # TODO: implement OBD-II Bluetooth connection
    return {"message": "OBD connection not implemented yet"}


@router.websocket("/ws")
async def obd_websocket(websocket: WebSocket):
    await websocket.accept()
    # TODO: implement real-time OBD data streaming
    await websocket.close()
