from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DbSession
from app.models.appointment import Appointment
from app.models.lead import Lead, LeadStatus
from app.models.message import Message
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(user: CurrentUser, db: DbSession) -> DashboardStats:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    org_id = user.organization_id

    leads_today = await db.scalar(
        select(func.count(Lead.id)).where(
            Lead.organization_id == org_id,
            Lead.created_at >= today_start,
        )
    )
    from app.models.conversation import Conversation

    messages_today = await db.scalar(
        select(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(
            Conversation.organization_id == org_id,
            Message.created_at >= today_start,
        )
    )
    appointments_today = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.organization_id == org_id,
            Appointment.scheduled_at >= today_start,
        )
    )
    total_leads = await db.scalar(
        select(func.count(Lead.id)).where(Lead.organization_id == org_id)
    )
    won_leads = await db.scalar(
        select(func.count(Lead.id)).where(
            Lead.organization_id == org_id,
            Lead.status == LeadStatus.WON.value,
        )
    )
    conversion = (won_leads / total_leads * 100) if total_leads else 0.0

    return DashboardStats(
        leads_today=leads_today or 0,
        messages_today=messages_today or 0,
        appointments_today=appointments_today or 0,
        total_leads=total_leads or 0,
        conversion_rate=round(conversion, 1),
    )
