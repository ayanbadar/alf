from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import CurrentUser, DbSession
from app.core.pagination import DEFAULT_LIMIT, PaginationLimit, PaginationOffset, paginate
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import ConversationResponse, MessageResponse, ReplyRequest
from app.schemas.pagination import PaginatedResponse
from app.services.chat.orchestrator import ChatOrchestrator

router = APIRouter(prefix="/conversations", tags=["conversations"])


async def _last_message_preview(db: DbSession, conversation_id: int) -> str | None:
    result = await db.execute(
        select(Message.content)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    content = result.scalar_one_or_none()
    return content[:80] if content else None


@router.get("", response_model=PaginatedResponse[ConversationResponse])
async def list_conversations(
    user: CurrentUser,
    db: DbSession,
    limit: PaginationLimit = DEFAULT_LIMIT,
    offset: PaginationOffset = 0,
) -> PaginatedResponse[ConversationResponse]:
    stmt = (
        select(Conversation)
        .where(Conversation.organization_id == user.organization_id)
        .options(selectinload(Conversation.contact))
        .order_by(Conversation.last_message_at.desc().nulls_last(), Conversation.id.desc())
    )
    rows, total = await paginate(db, stmt, limit=limit, offset=offset)
    items = []
    for conv in rows:
        preview = await _last_message_preview(db, conv.id)
        items.append(
            ConversationResponse(
                id=conv.id,
                contact_wa_id=conv.contact.wa_id,
                contact_name=conv.contact.name,
                human_mode=conv.human_mode,
                last_message_at=conv.last_message_at,
                last_message_preview=preview,
            )
        )
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: int, user: CurrentUser, db: DbSession
) -> list[MessageResponse]:
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.organization_id == user.organization_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Conversation not found")
    msgs = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    return [MessageResponse.model_validate(m) for m in msgs.scalars().all()]


@router.post("/{conversation_id}/reply", response_model=MessageResponse)
async def agent_reply(
    conversation_id: int,
    body: ReplyRequest,
    user: CurrentUser,
    db: DbSession,
) -> MessageResponse:
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
    orchestrator = ChatOrchestrator()
    message = await orchestrator.send_agent_reply(db, conversation, body.content)
    await db.flush()
    return MessageResponse.model_validate(message)


@router.post("/{conversation_id}/takeover", status_code=status.HTTP_204_NO_CONTENT)
async def takeover(conversation_id: int, user: CurrentUser, db: DbSession) -> None:
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.organization_id == user.organization_id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation.human_mode = True
    conversation.ai_enabled = False
