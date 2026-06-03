import hashlib
import hmac
import json
import logging
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def verify_signature(payload: bytes, signature_header: str | None) -> bool:
    settings = get_settings()
    if not settings.meta_app_secret:
        logger.warning("META_APP_SECRET not set; skipping signature validation")
        return True
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    expected = signature_header.split("=", 1)[1]
    digest = hmac.new(
        settings.meta_app_secret.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(digest, expected)


def parse_webhook_payload(data: dict[str, Any]) -> list[dict[str, Any]]:
    """Extract normalized inbound events from Meta webhook payload."""
    events: list[dict[str, Any]] = []
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            metadata = value.get("metadata", {})
            phone_number_id = metadata.get("phone_number_id")
            for message in value.get("messages", []):
                events.append(
                    {
                        "type": "message",
                        "phone_number_id": phone_number_id,
                        "wa_id": message.get("from"),
                        "wamid": message.get("id"),
                        "timestamp": message.get("timestamp"),
                        "message_type": message.get("type"),
                        "text": _extract_text(message),
                        "raw": message,
                    }
                )
            for status in value.get("statuses", []):
                events.append(
                    {
                        "type": "status",
                        "phone_number_id": phone_number_id,
                        "wamid": status.get("id"),
                        "status": status.get("status"),
                        "wa_id": status.get("recipient_id"),
                    }
                )
    return events


def _extract_text(message: dict[str, Any]) -> str:
    msg_type = message.get("type")
    if msg_type == "text":
        return message.get("text", {}).get("body", "")
    if msg_type == "button":
        return message.get("button", {}).get("text", "")
    if msg_type == "interactive":
        interactive = message.get("interactive", {})
        if "button_reply" in interactive:
            return interactive["button_reply"].get("title", "")
        if "list_reply" in interactive:
            return interactive["list_reply"].get("title", "")
    return ""
