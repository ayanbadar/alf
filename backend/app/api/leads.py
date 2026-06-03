from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.core.pagination import DEFAULT_LIMIT, PaginationLimit, PaginationOffset, paginate
from app.models.lead import Lead
from app.schemas.lead import LeadResponse, LeadUpdate
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("", response_model=PaginatedResponse[LeadResponse])
async def list_leads(
    user: CurrentUser,
    db: DbSession,
    limit: PaginationLimit = DEFAULT_LIMIT,
    offset: PaginationOffset = 0,
) -> PaginatedResponse[LeadResponse]:
    stmt = (
        select(Lead)
        .where(Lead.organization_id == user.organization_id)
        .order_by(Lead.created_at.desc())
    )
    rows, total = await paginate(db, stmt, limit=limit, offset=offset)
    return PaginatedResponse(
        items=[LeadResponse.model_validate(l) for l in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int, body: LeadUpdate, user: CurrentUser, db: DbSession
) -> LeadResponse:
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.organization_id == user.organization_id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    await db.flush()
    return LeadResponse.model_validate(lead)
