import json
import logging

import dateparser
import pytz
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.security import decrypt_token
from app.models.appointment import Appointment, AppointmentStatus
from app.models.conversation import Conversation
from app.models.lead import Lead, LeadStatus
from app.models.message import Message, MessageSender
from app.models.organization import Organization
from app.models.whatsapp_account import WhatsAppAccount
from app.services.chat.prompts import LEAD_EXTRACTION_PROMPT, REAL_ESTATE_SYSTEM_PROMPT, build_context_block
from app.services.rag.retriever import retrieve_chunks
from app.services.whatsapp.client import WhatsAppClient
from app.services.whatsapp.inbound import save_outbound_message, touch_conversation

logger = logging.getLogger(__name__)

HANDOVER_KEYWORDS = {"/agent", "human", "insaan", "baat insaan", "sales team", "representative"}


class ChatOrchestrator:
    async def process_inbound(
        self,
        db: AsyncSession,
        *,
        conversation_id: int,
        inbound_text: str,
        wamid: str | None = None,
    ) -> None:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(
                selectinload(Conversation.contact),
                selectinload(Conversation.messages),
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            return

        org_result = await db.execute(
            select(Organization).where(Organization.id == conversation.organization_id)
        )
        org = org_result.scalar_one()

        wa_result = await db.execute(
            select(WhatsAppAccount).where(
                WhatsAppAccount.organization_id == conversation.organization_id
            )
        )
        wa_account = wa_result.scalar_one_or_none()
        if not wa_account:
            logger.error("No WhatsApp account for org %s", conversation.organization_id)
            return

        touch_conversation(conversation)
        text_lower = inbound_text.strip().lower()

        if conversation.human_mode or text_lower == "/agent" or _needs_handover(text_lower):
            conversation.human_mode = True
            conversation.ai_enabled = False
            if text_lower == "/agent":
                reply = (
                    "Hamari sales team ab aap ki madad karegi. / Our sales team will assist you shortly."
                )
                await self._send_and_save(
                    db, conversation, wa_account, conversation.contact.wa_id, reply, wamid=wamid
                )
            await db.flush()
            return

        if not conversation.ai_enabled:
            return

        chunks = await retrieve_chunks(db, conversation.organization_id, inbound_text)
        max_score = max((c.score for c in chunks), default=0.0)
        settings = get_settings()
        low_confidence = max_score < settings.rag_similarity_threshold

        if low_confidence and not chunks:
            conversation.human_mode = True
            reply = (
                "Is maloomat ke liye hamari sales team aap se rabta karegi. "
                "Our sales team will contact you shortly."
            )
            await self._send_and_save(
                db, conversation, wa_account, conversation.contact.wa_id, reply, wamid=wamid
            )
            await db.flush()
            return

        reply_text = await self._generate_reply(db, org, conversation, inbound_text, chunks)
        chunk_ids = ",".join(str(c.chunk_id) for c in chunks[:5]) if chunks else None

        extraction = await self._extract_lead_fields(
            inbound_text, conversation.contact.wa_id, conversation
        )
        lead = await self._apply_lead_updates(db, conversation, extraction)
        if lead and lead.phone and lead.requirement:
            logger.info(
                "New lead ready for sales: org=%s phone=%s requirement=%s",
                conversation.organization_id,
                lead.phone,
                lead.requirement[:80],
            )
        await self._maybe_create_appointment(db, conversation, extraction, org.timezone)

        if extraction.get("send_brochure"):
            reply_text += "\n\nBrochure bhej rahe hain / Sending brochure details."

        if extraction.get("needs_human"):
            conversation.human_mode = True
            reply_text += "\n\nSales team ko connect kar rahe hain."

        await self._send_and_save(
            db,
            conversation,
            wa_account,
            conversation.contact.wa_id,
            reply_text,
            wamid=wamid,
            source_chunk_ids=chunk_ids,
        )

        if wamid:
            try:
                client = self._client(wa_account)
                await client.mark_read(wamid)
            except Exception:
                logger.debug("mark_read failed", exc_info=True)

        await db.flush()

    async def send_agent_reply(
        self,
        db: AsyncSession,
        conversation: Conversation,
        content: str,
    ) -> Message:
        wa_result = await db.execute(
            select(WhatsAppAccount).where(
                WhatsAppAccount.organization_id == conversation.organization_id
            )
        )
        wa_account = wa_result.scalar_one_or_none()
        if not wa_account:
            raise ValueError("WhatsApp not configured")
        contact = conversation.contact
        response = await self._client(wa_account).send_text(contact.wa_id, content)
        wamid = _extract_sent_wamid(response)
        return await save_outbound_message(
            db,
            conversation_id=conversation.id,
            content=content,
            sender=MessageSender.AGENT.value,
            wamid=wamid,
        )

    async def _generate_reply(
        self,
        db: AsyncSession,
        org: Organization,
        conversation: Conversation,
        user_message: str,
        chunks: list,
    ) -> str:
        settings = get_settings()
        context = build_context_block(chunks)
        system = REAL_ESTATE_SYSTEM_PROMPT.format(context=context, org_name=org.name)
        history = _conversation_history(conversation)
        messages = [{"role": "system", "content": system}, *history, {"role": "user", "content": user_message}]

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model=settings.chat_model,
            messages=messages,
            temperature=0.3,
            max_tokens=800,
        )
        return response.choices[0].message.content or ""

    async def _extract_lead_fields(
        self, message: str, wa_id: str, conversation: Conversation
    ) -> dict:
        settings = get_settings()
        prompt = LEAD_EXTRACTION_PROMPT.format(message=message, wa_id=wa_id)
        history = "\n".join(
            f"{m.sender}: {m.content}"
            for m in list(conversation.messages)[-6:]
            if m.content
        )
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        try:
            response = await client.chat.completions.create(
                model=settings.chat_model,
                messages=[
                    {"role": "system", "content": "Return valid JSON only."},
                    {"role": "user", "content": f"{prompt}\n\nRecent:\n{history}"},
                ],
                temperature=0,
                response_format={"type": "json_object"},
            )
            return json.loads(response.choices[0].message.content or "{}")
        except Exception:
            logger.debug("Lead extraction failed", exc_info=True)
            return {}

    async def _apply_lead_updates(
        self, db: AsyncSession, conversation: Conversation, data: dict
    ) -> Lead | None:
        phone = data.get("phone") or conversation.contact.wa_id
        result = await db.execute(
            select(Lead).where(
                Lead.organization_id == conversation.organization_id,
                Lead.phone == phone,
            )
        )
        lead = result.scalar_one_or_none()
        if not lead:
            lead = Lead(
                organization_id=conversation.organization_id,
                conversation_id=conversation.id,
                contact_id=conversation.contact_id,
                phone=phone,
                status=LeadStatus.NEW.value,
            )
            db.add(lead)
        for field in ("name", "requirement", "budget", "project_interest"):
            value = data.get(field)
            if value:
                setattr(lead, field, value)
        await db.flush()
        return lead

    async def _maybe_create_appointment(
        self, db: AsyncSession, conversation: Conversation, data: dict, tz_name: str
    ) -> None:
        if not data.get("wants_appointment") and not data.get("appointment_datetime"):
            return
        dt_str = data.get("appointment_datetime")
        if not dt_str:
            return
        try:
            tz = pytz.timezone(tz_name)
            parsed = dateparser.parse(dt_str, settings={"TIMEZONE": tz_name, "RETURN_AS_TIMEZONE_AWARE": True})
            if not parsed:
                return
            if parsed.tzinfo is None:
                parsed = tz.localize(parsed)
            appt = Appointment(
                organization_id=conversation.organization_id,
                conversation_id=conversation.id,
                contact_id=conversation.contact_id,
                scheduled_at=parsed,
                project=data.get("project_interest"),
                status=AppointmentStatus.SCHEDULED.value,
            )
            db.add(appt)
            await db.flush()
        except Exception:
            logger.debug("Appointment parse failed", exc_info=True)

    async def _send_and_save(
        self,
        db: AsyncSession,
        conversation: Conversation,
        wa_account: WhatsAppAccount,
        to_wa_id: str,
        content: str,
        *,
        wamid: str | None = None,
        source_chunk_ids: str | None = None,
    ) -> None:
        client = self._client(wa_account)
        response = await client.send_text(to_wa_id, content)
        sent_wamid = _extract_sent_wamid(response)
        await save_outbound_message(
            db,
            conversation_id=conversation.id,
            content=content,
            sender=MessageSender.AI.value,
            wamid=sent_wamid,
            source_chunk_ids=source_chunk_ids,
        )

    def _client(self, wa_account: WhatsAppAccount) -> WhatsAppClient:
        token = decrypt_token(wa_account.access_token_encrypted)
        return WhatsAppClient(wa_account.phone_number_id, token)


def _conversation_history(conversation: Conversation) -> list[dict[str, str]]:
    recent = sorted(conversation.messages, key=lambda m: m.created_at)[-10:]
    history = []
    for msg in recent:
        if msg.sender == MessageSender.CUSTOMER.value:
            history.append({"role": "user", "content": msg.content})
        elif msg.sender in {MessageSender.AI.value, MessageSender.AGENT.value}:
            history.append({"role": "assistant", "content": msg.content})
    return history[:-1] if history else []


def _needs_handover(text: str) -> bool:
    return any(kw in text for kw in HANDOVER_KEYWORDS)


def _extract_sent_wamid(response: dict) -> str | None:
    messages = response.get("messages", [])
    if messages:
        return messages[0].get("id")
    return None
