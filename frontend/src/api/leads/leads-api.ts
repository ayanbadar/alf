import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LeadsService } from "./leads-service";
import { leadsKeys } from "./leads-key";

export const useGetAllLeads = (offset: number) => {
    return useQuery({
        queryFn: () => LeadsService.getAllLeads(offset),
        queryKey: leadsKeys.list(offset),
    });
}

export const useUpdateLeadById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: LeadsService.updateLeadStatusById,
        mutationKey: leadsKeys.lists(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadsKeys.lists() })
        }
    });
};