import { WhatsAppSettings } from "@/types/connection";
import { api } from "..";

const API_URL = "/settings";

export class ConnectionService {
    static async getWhatsappSettings(): Promise<WhatsAppSettings> {
        const response = await api.get(`${API_URL}/whatsapp`);
        return response.data;
    };

    static async saveWhatsappSettings(payload: WhatsAppSettings) {
        const response = await api.put(`${API_URL}/whatsapp`, payload);
        return response.data;
    }
};