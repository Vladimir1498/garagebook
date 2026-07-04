from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.organization import Organization, OrganizationMember, OrganizationCar
from app.repositories.base import BaseRepository


class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self, db: AsyncSession):
        super().__init__(Organization, db)

    async def get_user_organizations(self, user_id: UUID) -> list[Organization]:
        result = await self.db.execute(
            select(Organization).join(OrganizationMember).where(OrganizationMember.user_id == user_id)
        )
        return list(result.scalars().all())
