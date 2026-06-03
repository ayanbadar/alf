from datetime import datetime

from pydantic import BaseModel, Field


class LeadResponse(BaseModel):
    id: int
    phone: str
    name: str | None
    requirement: str | None
    budget: str | None
    project_interest: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadUpdate(BaseModel):
    status: str | None = None
    name: str | None = None
    requirement: str | None = None
    budget: str | None = None
    project_interest: str | None = None
