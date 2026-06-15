import { paginatedUrl } from "@/lib/pagination";
import { api } from "..";

const API_URL = "/conversations";

export class ChatService {
    static async getAllChats(offset: number) {
        const response = await api.get(paginatedUrl(API_URL, offset));
        return response.data;
    }

    static async takeover(id: number) {
        const response = await api.post(`${API_URL}/${id}/takeover`);
        return response.data;
    }

    static async sendReply(id: number, content: string) {
        const response = await api.post(`${API_URL}/${id}/reply`, content);
        return response.data;
    }

    static async sendBrochure(id: number) {
        const response = await api.post(`${API_URL}/${id}/send-brochure`);
        return response.data;
    }
}