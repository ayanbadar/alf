import logging
from pathlib import Path

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class WhatsAppClient:
    def __init__(self, phone_number_id: str, access_token: str) -> None:
        settings = get_settings()
        self.phone_number_id = phone_number_id
        self.access_token = access_token
        self.base_url = f"https://graph.facebook.com/{settings.meta_graph_api_version}"

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.access_token}"}

    async def send_text(self, to_wa_id: str, body: str) -> dict:
        payload = {
            "messaging_product": "whatsapp",
            "to": to_wa_id,
            "type": "text",
            "text": {"body": body},
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/{self.phone_number_id}/messages",
                headers=self._headers(),
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def send_document_by_id(self, to_wa_id: str, media_id: str, filename: str) -> dict:
        payload = {
            "messaging_product": "whatsapp",
            "to": to_wa_id,
            "type": "document",
            "document": {"id": media_id, "filename": filename},
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/{self.phone_number_id}/messages",
                headers=self._headers(),
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def upload_media(self, file_path: Path, mime_type: str) -> str:
        async with httpx.AsyncClient(timeout=120.0) as client:
            with file_path.open("rb") as f:
                files = {"file": (file_path.name, f, mime_type)}
                data = {"messaging_product": "whatsapp", "type": mime_type}
                response = await client.post(
                    f"{self.base_url}/{self.phone_number_id}/media",
                    headers=self._headers(),
                    data=data,
                    files=files,
                )
            response.raise_for_status()
            return response.json()["id"]

    async def mark_read(self, message_id: str) -> None:
        payload = {"messaging_product": "whatsapp", "status": "read", "message_id": message_id}
        async with httpx.AsyncClient(timeout=15.0) as client:
            await client.post(
                f"{self.base_url}/{self.phone_number_id}/messages",
                headers=self._headers(),
                json=payload,
            )
