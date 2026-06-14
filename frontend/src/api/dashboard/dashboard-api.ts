import { useQuery } from "@tanstack/react-query";
import { DashboardSerivce } from "./dashboard-service";

export const useGetStats = () => {
    return useQuery({
        queryFn: DashboardSerivce.getStats,
        queryKey: ["stats"],
    });
};