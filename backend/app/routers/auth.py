from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshRequest, UserResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Simple in-memory token blacklist (for production use Redis)
_token_blacklist: set[str] = set()


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # Validate email format
    if "@" not in data.email or "." not in data.email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Validate password strength
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not any(c.isupper() for c in data.password):
        raise HTTPException(status_code=400, detail="Password must contain an uppercase letter")
    if not any(c.isdigit() for c in data.password):
        raise HTTPException(status_code=400, detail="Password must contain a digit")

    repo = UserRepository(db)
    if await repo.get_by_email(data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await repo.create(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name.strip(),
    )
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_email(data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    # Check if token is blacklisted
    if data.refresh_token in _token_blacklist:
        raise HTTPException(status_code=401, detail="Token has been revoked")

    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload["sub"]

    # Verify user still exists and is active
    from uuid import UUID
    try:
        user = await db.get(User, UUID(user_id))
    except Exception:
        user = None
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or disabled")

    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/logout")
async def logout(request: Request, user=Depends(get_current_user)):
    # Blacklist the access token
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        _token_blacklist.add(token)
    return {"message": "Logged out"}


@router.post("/google", response_model=TokenResponse)
async def google_auth(credential: str, db: AsyncSession = Depends(get_db)):
    # TODO: verify Google credential and create/find user
    raise HTTPException(status_code=501, detail="Google OAuth not configured")


@router.post("/apple", response_model=TokenResponse)
async def apple_auth(code: str, db: AsyncSession = Depends(get_db)):
    # TODO: verify Apple identity token
    raise HTTPException(status_code=501, detail="Apple OAuth not configured")
