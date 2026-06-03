from datetime import datetime

from pydantic import BaseModel


class AppointmentResponse(BaseModel):
    id: int
    scheduled_at: datetime
    project: str | None
    notes: str | None
    status: str
    contact_phone: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AppointmentCreate(BaseModel):
    scheduled_at: datetime
    project: str | None = None
    notes: str | None = None
    conversation_id: int | None = None
    contact_id: int | None = None
