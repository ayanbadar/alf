export type Lead = {
    id: number;
    phone: string;
    name: string | null;
    requirement: string | null;
    budget: string | null;
    project_interest: string | null;
    status: string;
    created_at: string;
}

export enum LeadStatus {
    New = "new",
    Contacted = "contacted",
    Won = "won",
    Lost = "lost"
}

export const statuses = Object.values(LeadStatus);