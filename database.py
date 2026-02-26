import os

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Configure it in the environment before starting the app."
    )

SQLALCHEMY_ECHO = os.getenv("SQLALCHEMY_ECHO", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}

engine = create_async_engine(DATABASE_URL, echo=SQLALCHEMY_ECHO)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session():
    async with async_session() as session:
        yield session
