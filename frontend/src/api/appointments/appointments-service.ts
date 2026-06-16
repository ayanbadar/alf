import { PaginatedResponse, paginatedUrl } from "@/lib/pagination";
import { api } from "..";
import { Appointment } from "@/types/appointments";

const API_URL = "/appointments";

export class AppointmentService {
    static async getAllAppointments(offset: number): Promise<PaginatedResponse<Appointment>> {
        const response = await api.get(paginatedUrl(API_URL, offset));
        return response.data;
    };
};