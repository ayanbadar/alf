import { Stats } from "@/types/dashboard";
import { api } from "..";

const API_URL = "/dashboard";

export class DashboardSerivce {
    static async getStats(): Promise<Stats> {
        const response = await api.get(`${API_URL}/stats`);
        return response.data;
    };
};