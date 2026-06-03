from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.document import DocumentChunk, DocumentStatus
from app.models.document import Document as DocumentModel
from app.services.rag.embeddings import embed_query


@dataclass
class RetrievedChunk:
    chunk_id: int
    content: str
    score: float
    metadata: dict


async def retrieve_chunks(
    db: AsyncSession,
    organization_id: int,
    query: str,
    top_k: int | None = None,
) -> list[RetrievedChunk]:
    settings = get_settings()
    k = top_k or settings.rag_top_k
    query_embedding = await embed_query(query)

    distance = DocumentChunk.embedding.cosine_distance(query_embedding)
    stmt = (
        select(
            DocumentChunk.id,
            DocumentChunk.content,
            DocumentChunk.metadata_,
            distance.label("distance"),
        )
        .join(DocumentModel, DocumentModel.id == DocumentChunk.document_id)
        .where(
            DocumentChunk.organization_id == organization_id,
            DocumentModel.status == DocumentStatus.READY.value,
        )
        .order_by(distance)
        .limit(k)
    )
    result = await db.execute(stmt)
    rows = result.all()
    chunks: list[RetrievedChunk] = []
    for row in rows:
        similarity = 1.0 - float(row.distance)
        chunks.append(
            RetrievedChunk(
                chunk_id=row.id,
                content=row.content,
                score=similarity,
                metadata=row.metadata_ or {},
            )
        )
    return chunks
