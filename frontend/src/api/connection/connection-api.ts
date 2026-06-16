import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ConnectionService } from "./connection-service";

export const useGetWhatsappSettings = () => {
    return useQuery({
        queryFn: ConnectionService.getWhatsappSettings,
        queryKey: ["settings"],
    });
}

export const useSaveWhatsappSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ConnectionService.saveWhatsappSettings,
        mutationKey: ["settings"],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] })
        },
    });
};