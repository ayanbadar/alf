import { PaginatedResponse, paginatedUrl } from "@/lib/pagination";
import { Lead } from "@/types/leads";
import { api } from "..";

const API_URL = "/leads";

export class LeadsService {
    static async getAllLeads(offset: number): Promise<PaginatedResponse<Lead>> {
        const response = await api.get(paginatedUrl(API_URL, offset));
        return response.data;
    };

    static async updateLeadStatusById({ id, status }: { id: number, status: string }) {
        if (!id) throw new Error("Id is required");
        const response = await api.patch(`${API_URL}/${id}`, status);
        return response.data;
    };
};
