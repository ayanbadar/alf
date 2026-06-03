import logging

from arq import create_pool
from arq.connections import RedisSettings

from app.core.config import get_settings
from app.core.database import async_session_maker
from app.services.chat.orchestrator import ChatOrchestrator
from app.services.rag.indexer import index_document

logger = logging.getLogger(__name__)
_redis_pool = None


async def startup(ctx: dict) -> None:
    global _redis_pool
    settings = get_settings()
    _redis_pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    ctx["redis"] = _redis_pool
    logger.info("ARQ worker started")


async def shutdown(ctx: dict) -> None:
    if ctx.get("redis"):
        await ctx["redis"].close()
    logger.info("ARQ worker stopped")


async def process_inbound_message(
    ctx: dict,
    conversation_id: int,
    inbound_text: str,
    wamid: str | None = None,
) -> None:
    orchestrator = ChatOrchestrator()
    async with async_session_maker() as db:
        try:
            await orchestrator.process_inbound(
                db,
                conversation_id=conversation_id,
                inbound_text=inbound_text,
                wamid=wamid,
            )
            await db.commit()
        except Exception:
            await db.rollback()
            logger.exception("Failed processing conversation %s", conversation_id)
            raise


async def index_document_task(ctx: dict, document_id: int) -> None:
    async with async_session_maker() as db:
        try:
            await index_document(db, document_id)
            await db.commit()
        except Exception:
            await db.rollback()
            logger.exception("Failed indexing document %s", document_id)
            raise


async def enqueue_inbound(conversation_id: int, inbound_text: str, wamid: str | None) -> None:
    settings = get_settings()
    pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    try:
        await pool.enqueue_job(
            "process_inbound_message",
            conversation_id,
            inbound_text,
            wamid,
        )
    finally:
        await pool.close()


async def enqueue_index_document(document_id: int) -> None:
    settings = get_settings()
    pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    try:
        await pool.enqueue_job("index_document_task", document_id)
    finally:
        await pool.close()
