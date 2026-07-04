import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Get DATABASE_URL from environment
database_url = os.environ.get("DATABASE_URL", "")

# Convert postgres:// or postgresql:// to postgresql+asyncpg://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Fallback for local dev
if not database_url:
    database_url = "postgresql+asyncpg://garagebook:garagebook_secret@localhost:5432/garagebook"

engine = create_async_engine(database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with async_session() as session:
        yield session
