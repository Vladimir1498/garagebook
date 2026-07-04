from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.tiers import require_tier
from app.models.subscription import SubscriptionTier
from app.models.user import User
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationCreate, OrganizationResponse, InviteRequest, MemberResponse

router = APIRouter(prefix="/api/v1/fleets", tags=["fleets"])


@router.get("")
async def list_fleets(user: User = Depends(get_current_user), sub=Depends(require_tier(SubscriptionTier.fleet)), db: AsyncSession = Depends(get_db)):
    repo = OrganizationRepository(db)
    orgs = await repo.get_user_organizations(user.id)
    return [OrganizationResponse.model_validate(o) for o in orgs]


@router.get("/{fleet_id}", response_model=OrganizationResponse)
async def get_fleet(fleet_id: UUID, user: User = Depends(get_current_user), sub=Depends(require_tier(SubscriptionTier.fleet)), db: AsyncSession = Depends(get_db)):
    repo = OrganizationRepository(db)
    org = await repo.get(fleet_id)
    if not org:
        raise HTTPException(status_code=404, detail="Fleet not found")
    return org


@router.post("", response_model=OrganizationResponse)
async def create_fleet(data: OrganizationCreate, user: User = Depends(get_current_user), sub=Depends(require_tier(SubscriptionTier.fleet)), db: AsyncSession = Depends(get_db)):
    repo = OrganizationRepository(db)
    org = await repo.create(name=data.name, owner_id=user.id)
    # Add owner as member
    from app.models.organization import OrganizationMember, OrganizationRole
    member = OrganizationMember(organization_id=org.id, user_id=user.id, role=OrganizationRole.owner)
    db.add(member)
    await db.commit()
    return org


@router.get("/{fleet_id}/members")
async def list_members(fleet_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.organization import OrganizationMember
    result = await db.execute(select(OrganizationMember).where(OrganizationMember.organization_id == fleet_id))
    members = list(result.scalars().all())
    return [MemberResponse.model_validate(m) for m in members]


@router.post("/{fleet_id}/invite", response_model=MemberResponse)
async def invite_member(fleet_id: UUID, data: InviteRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from app.models.organization import OrganizationMember, OrganizationRole
    from app.repositories.user_repository import UserRepository
    user_repo = UserRepository(db)
    target_user = await user_repo.get_by_email(data.email)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    member = OrganizationMember(organization_id=fleet_id, user_id=target_user.id, role=OrganizationRole(data.role))
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return MemberResponse.model_validate(member)


@router.delete("/{fleet_id}/members/{member_id}")
async def remove_member(fleet_id: UUID, member_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.organization import OrganizationMember
    result = await db.execute(select(OrganizationMember).where(OrganizationMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.delete(member)
    await db.commit()
    return {"message": "Removed"}
