from pydantic import BaseModel, Field


class WhatsAppSettingsUpdate(BaseModel):
    phone_number_id: str = Field(min_length=1)
    access_token: str = Field(min_length=1)
    waba_id: str | None = None
    display_phone_number: str | None = None


class WhatsAppSettingsResponse(BaseModel):
    phone_number_id: str | None
    waba_id: str | None
    display_phone_number: str | None
    is_connected: bool

    model_config = {"from_attributes": True}
