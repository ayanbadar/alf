import { LoginPayload, RegisterPayload, User } from "@/types/auth";
import { api } from "..";

const API_URL = "/auth";

export class AuthService {
    static async me(): Promise<User> {
        const response = await api.get(`${API_URL}/me`);
        return response.data;
    }

    static async login(payload: LoginPayload) {
        const response = await api.post(`${API_URL}/login`, payload);
        return response.data;
    }

    static async register(payload: RegisterPayload) {
        const response = await api.post(`${API_URL}/register`, payload);
        return response.data;
    };

    static async updateUser(payload: { full_name: string }) {
        const response = await api.patch(`${API_URL}/me`, payload);
        return response.data;
    };
};