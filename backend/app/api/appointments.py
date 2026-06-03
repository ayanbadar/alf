from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.core.pagination import DEFAULT_LIMIT, PaginationLimit, PaginationOffset, paginate
from app.models.appointment import Appointment
from app.models.contact import Contact
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _appointment_response(appt: Appointment, phone: str | None) -> AppointmentResponse:
    return AppointmentResponse(
        id=appt.id,
        scheduled_at=appt.scheduled_at,
        project=appt.project,
        notes=appt.notes,
        status=appt.status,
        contact_phone=phone,
        created_at=appt.created_at,
    )


@router.get("", response_model=PaginatedResponse[AppointmentResponse])
async def list_appointments(
    user: CurrentUser,
    db: DbSession,
    limit: PaginationLimit = DEFAULT_LIMIT,
    offset: PaginationOffset = 0,
) -> PaginatedResponse[AppointmentResponse]:
    stmt = (
        select(Appointment)
        .where(Appointment.organization_id == user.organization_id)
        .order_by(Appointment.scheduled_at.desc())
    )
    rows, total = await paginate(db, stmt, limit=limit, offset=offset)
    items = []
    for appt in rows:
        phone = None
        if appt.contact_id:
            c = await db.get(Contact, appt.contact_id)
            phone = c.wa_id if c else None
        items.append(_appointment_response(appt, phone))
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)


@router.post("", response_model=AppointmentResponse)
async def create_appointment(
    body: AppointmentCreate, user: CurrentUser, db: DbSession
) -> AppointmentResponse:
    appt = Appointment(
        organization_id=user.organization_id,
        conversation_id=body.conversation_id,
        contact_id=body.contact_id,
        scheduled_at=body.scheduled_at,
        project=body.project,
        notes=body.notes,
    )
    db.add(appt)
    await db.flush()
    phone = None
    if body.contact_id:
        c = await db.get(Contact, body.contact_id)
        phone = c.wa_id if c else None
    return _appointment_response(appt, phone)
