from datetime import datetime

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    id: int
    direction: str
    sender: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: int
    contact_wa_id: str
    contact_name: str | None
    human_mode: bool
    last_message_at: datetime | None
    last_message_preview: str | None = None

    model_config = {"from_attributes": True}


class ReplyRequest(BaseModel):
    content: str = Field(min_length=1)
