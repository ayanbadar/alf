import logging
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.document import Document, DocumentChunk, DocumentStatus
from app.services.rag.chunker import chunk_text
from app.services.rag.embeddings import embed_texts
from app.services.rag.text_extractor import extract_text

logger = logging.getLogger(__name__)


async def index_document(db: AsyncSession, document_id: int) -> None:
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        return

    document.status = DocumentStatus.INDEXING.value
    document.error_message = None
    await db.flush()

    try:
        path = Path(document.file_path)
        text = extract_text(path, document.mime_type)
        if not text.strip():
            raise ValueError("No text extracted from document")

        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("No chunks produced")

        await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document.id))

        embeddings = await embed_texts(chunks)
        settings = get_settings()

        for idx, (content, embedding) in enumerate(zip(chunks, embeddings, strict=True)):
            chunk = DocumentChunk(
                document_id=document.id,
                organization_id=document.organization_id,
                chunk_index=idx,
                content=content,
                token_count=len(content.split()),
                embedding=embedding,
                metadata_={"filename": document.filename},
            )
            db.add(chunk)

        document.status = DocumentStatus.READY.value
        await db.flush()
        logger.info("Indexed document %s with %s chunks", document.id, len(chunks))
    except Exception as exc:
        logger.exception("Failed to index document %s", document_id)
        document.status = DocumentStatus.FAILED.value
        document.error_message = str(exc)[:500]
        await db.flush()
        raise
