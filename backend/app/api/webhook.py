import json
import logging

from fastapi import APIRouter, HTTPException, Query, Request, Response

from app.core.config import get_settings
from app.core.database import async_session_maker
from app.services.whatsapp.inbound import (
    get_or_create_contact,
    get_or_create_conversation,
    get_whatsapp_account_by_phone_id,
    save_inbound_message,
    touch_conversation,
)
from app.services.whatsapp.webhook import parse_webhook_payload, verify_signature
from app.workers.tasks import enqueue_inbound

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.get("/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge"),
) -> Response:
    settings = get_settings()
    if hub_mode == "subscribe" and hub_verify_token == settings.meta_webhook_verify_token:
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def receive_webhook(request: Request) -> dict:
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")
    if not verify_signature(body, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    data = json.loads(body)
    events = parse_webhook_payload(data)

    async with async_session_maker() as db:
        for event in events:
            if event["type"] != "message":
                continue
            phone_number_id = event.get("phone_number_id")
            if not phone_number_id:
                continue
            wa_account = await get_whatsapp_account_by_phone_id(db, phone_number_id)
            if not wa_account:
                logger.warning("Unknown phone_number_id: %s", phone_number_id)
                continue

            wa_id = event.get("wa_id")
            text = event.get("text", "").strip()
            if not wa_id or not text:
                continue

            contact = await get_or_create_contact(db, wa_account.organization_id, wa_id)
            conversation = await get_or_create_conversation(
                db, wa_account.organization_id, contact.id
            )
            msg = await save_inbound_message(
                db,
                conversation_id=conversation.id,
                wamid=event.get("wamid"),
                content=text,
            )
            if msg is None:
                continue
            touch_conversation(conversation)
            await db.commit()

            try:
                await enqueue_inbound(conversation.id, text, event.get("wamid"))
            except Exception:
                logger.exception("Failed to enqueue job for conversation %s", conversation.id)

    return {"status": "ok"}
