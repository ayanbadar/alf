from typing import Any

from fastapi import Query
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing_extensions import Annotated

DEFAULT_LIMIT = 10
MAX_LIMIT = 100

PaginationLimit = Annotated[int, Query(ge=1, le=MAX_LIMIT, description="Page size")]
PaginationOffset = Annotated[int, Query(ge=0, description="Number of rows to skip")]


async def paginate(
    db: AsyncSession,
    stmt: Select[Any],
    *,
    limit: int = DEFAULT_LIMIT,
    offset: int = 0,
) -> tuple[list[Any], int]:
    """Apply limit/offset to a select and return (rows, total_count)."""
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = int(await db.scalar(count_stmt) or 0)
    result = await db.execute(stmt.limit(limit).offset(offset))
    return list(result.scalars().all()), total
