from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contact import Contact
from app.models.conversation import Conversation
from app.models.message import Message, MessageDirection, MessageSender
from app.models.whatsapp_account import WhatsAppAccount


async def get_whatsapp_account_by_phone_id(
    db: AsyncSession, phone_number_id: str
) -> WhatsAppAccount | None:
    result = await db.execute(
        select(WhatsAppAccount).where(WhatsAppAccount.phone_number_id == phone_number_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_contact(
    db: AsyncSession, organization_id: int, wa_id: str
) -> Contact:
    result = await db.execute(
        select(Contact).where(
            Contact.organization_id == organization_id,
            Contact.wa_id == wa_id,
        )
    )
    contact = result.scalar_one_or_none()
    if contact:
        return contact
    contact = Contact(organization_id=organization_id, wa_id=wa_id)
    db.add(contact)
    await db.flush()
    return contact


async def get_or_create_conversation(
    db: AsyncSession, organization_id: int, contact_id: int
) -> Conversation:
    result = await db.execute(
        select(Conversation).where(
            Conversation.organization_id == organization_id,
            Conversation.contact_id == contact_id,
        )
    )
    conversation = result.scalar_one_or_none()
    if conversation:
        return conversation
    conversation = Conversation(organization_id=organization_id, contact_id=contact_id)
    db.add(conversation)
    await db.flush()
    return conversation


async def save_inbound_message(
    db: AsyncSession,
    *,
    conversation_id: int,
    wamid: str | None,
    content: str,
) -> Message | None:
    if wamid:
        existing = await db.execute(select(Message).where(Message.wamid == wamid))
        if existing.scalar_one_or_none():
            return None
    message = Message(
        conversation_id=conversation_id,
        wamid=wamid,
        direction=MessageDirection.INBOUND.value,
        sender=MessageSender.CUSTOMER.value,
        content=content,
    )
    db.add(message)
    return message


async def save_outbound_message(
    db: AsyncSession,
    *,
    conversation_id: int,
    content: str,
    sender: str = MessageSender.AI.value,
    wamid: str | None = None,
    source_chunk_ids: str | None = None,
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        wamid=wamid,
        direction=MessageDirection.OUTBOUND.value,
        sender=sender,
        content=content,
        source_chunk_ids=source_chunk_ids,
    )
    db.add(message)
    return message


def touch_conversation(conversation: Conversation) -> None:
    conversation.last_message_at = datetime.now(timezone.utc)
