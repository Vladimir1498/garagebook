from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, db: AsyncSession):
        super().__init__(Document, db)

    async def get_car_documents(self, car_id: UUID, skip: int = 0, limit: int = 100) -> list[Document]:
        result = await self.db.execute(
            select(Document).where(Document.car_id == car_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())
