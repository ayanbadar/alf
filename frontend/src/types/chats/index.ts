export interface Conversation {
    id: number;
    contact_wa_id: string;
    contact_name: string | null;
    human_mode: boolean;
    last_message_at: string | null;
    last_message_preview: string | null;
}

export interface Message {
    id: number;
    direction: string;
    sender: string;
    content: string;
    created_at: string;
}
