import uuid
from pathlib import Path

import aiofiles
from fastapi import APIRouter, File, HTTPException, UploadFile
from sqlalchemy import select

from app.core.config import get_settings
from app.core.deps import CurrentUser, DbSession
from app.core.pagination import DEFAULT_LIMIT, PaginationLimit, PaginationOffset, paginate
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentResponse
from app.schemas.pagination import PaginatedResponse
from app.workers.tasks import enqueue_index_document

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}


@router.get("", response_model=PaginatedResponse[DocumentResponse])
async def list_documents(
    user: CurrentUser,
    db: DbSession,
    limit: PaginationLimit = DEFAULT_LIMIT,
    offset: PaginationOffset = 0,
) -> PaginatedResponse[DocumentResponse]:
    stmt = (
        select(Document)
        .where(Document.organization_id == user.organization_id)
        .order_by(Document.created_at.desc())
    )
    rows, total = await paginate(db, stmt, limit=limit, offset=offset)
    return PaginatedResponse(
        items=[DocumentResponse.model_validate(d) for d in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=DocumentResponse)
async def upload_document(
    user: CurrentUser,
    db: DbSession,
    file: UploadFile = File(...),
) -> DocumentResponse:
    if file.content_type not in ALLOWED_TYPES and not (file.filename or "").endswith(
        (".pdf", ".docx", ".txt")
    ):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    settings = get_settings()
    upload_root = Path(settings.upload_dir) / str(user.organization_id)
    upload_root.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename or "doc.pdf").suffix
    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest = upload_root / stored_name

    async with aiofiles.open(dest, "wb") as out:
        content = await file.read()
        await out.write(content)

    doc = Document(
        organization_id=user.organization_id,
        filename=file.filename or stored_name,
        file_path=str(dest),
        mime_type=file.content_type or "application/pdf",
        status=DocumentStatus.PENDING.value,
    )
    db.add(doc)
    await db.flush()

    try:
        await enqueue_index_document(doc.id)
    except Exception:
        from app.services.rag.indexer import index_document

        await index_document(db, doc.id)

    return DocumentResponse.model_validate(doc)


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: int, user: CurrentUser, db: DbSession) -> None:
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.organization_id == user.organization_id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    path = Path(doc.file_path)
    if path.exists():
        path.unlink()
    await db.delete(doc)
