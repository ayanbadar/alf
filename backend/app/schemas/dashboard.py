from pydantic import BaseModel


class DashboardStats(BaseModel):
    leads_today: int
    messages_today: int
    appointments_today: int
    total_leads: int
    conversion_rate: float
