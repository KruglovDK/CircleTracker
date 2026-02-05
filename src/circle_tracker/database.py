from typing import TYPE_CHECKING

from psycopg_pool import AsyncConnectionPool

from circle_tracker.config import settings

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

    from psycopg import AsyncConnection


class Database:
    pool: AsyncConnectionPool | None = None

    async def init_pool(self) -> None:
        self.pool = AsyncConnectionPool(conninfo=settings.db_url, open=False)
        await self.pool.open()

    async def close_pool(self) -> None:
        if self.pool:
            await self.pool.close()

    async def get_connection(self) -> AsyncGenerator[AsyncConnection]:
        if not self.pool:
            raise RuntimeError("Pool is not initialized")
        async with self.pool.connection() as conn:
            yield conn


db = Database()