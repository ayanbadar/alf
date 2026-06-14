import { useQuery } from "@tanstack/react-query"
import { AppointmentService } from "./appointments-service";

export const useGetAllAppointments = (offset: number) => {
    return useQuery({
        queryFn: () => AppointmentService.getAllAppointments(offset),
        queryKey: ["appointments"],
    });
}