export type Appointment = {
    id: number;
    scheduled_at: string;
    project: string | null;
    notes: string | null;
    status: string;
    contact_phone: string | null;
}

// 1. Pehle Statuses ka Enum banayein
export enum AppointmentStatus {
    Scheduled = "scheduled",
    Confirmed = "confirmed",
    Completed = "completed",
    Cancelled = "cancelled"
}

// 2. Phir Variant Mapping mein us Enum ko ba-taur Key Type use karein
export const statusVariant: Record<AppointmentStatus, "default" | "secondary" | "outline"> = {
    [AppointmentStatus.Scheduled]: "default",
    [AppointmentStatus.Confirmed]: "default",
    [AppointmentStatus.Completed]: "secondary",
    [AppointmentStatus.Cancelled]: "outline",
};