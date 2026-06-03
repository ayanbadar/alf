from pathlib import Path

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import CurrentUser, DbSession
from app.core.security import decrypt_token
from app.models.conversation import Conversation
from app.models.document import Document, DocumentStatus
from app.models.whatsapp_account import WhatsAppAccount
from app.services.whatsapp.client import WhatsAppClient

router = APIRouter(prefix="/conversations", tags=["brochure"])


@router.post("/{conversation_id}/send-brochure")
async def send_brochure(
    conversation_id: int,
    user: CurrentUser,
    db: DbSession,
    document_id: int | None = None,
) -> dict:
    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.organization_id == user.organization_id,
        )
        .options(selectinload(Conversation.contact))
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    doc_query = select(Document).where(
        Document.organization_id == user.organization_id,
        Document.status == DocumentStatus.READY.value,
    )
    if document_id:
        doc_query = doc_query.where(Document.id == document_id)
    doc_query = doc_query.order_by(Document.created_at.desc()).limit(1)
    doc_result = await db.execute(doc_query)
    document = doc_result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="No indexed document available")

    wa_result = await db.execute(
        select(WhatsAppAccount).where(WhatsAppAccount.organization_id == user.organization_id)
    )
    wa_account = wa_result.scalar_one_or_none()
    if not wa_account:
        raise HTTPException(status_code=400, detail="WhatsApp not configured")

    token = decrypt_token(wa_account.access_token_encrypted)
    client = WhatsAppClient(wa_account.phone_number_id, token)
    path = Path(document.file_path)
    media_id = await client.upload_media(path, document.mime_type)
    await client.send_document_by_id(
        conversation.contact.wa_id,
        media_id,
        document.filename,
    )
    return {"status": "sent", "document": document.filename, "media_id": media_id}
