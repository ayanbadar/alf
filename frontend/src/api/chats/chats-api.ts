import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChatService } from "./chats-service";

export const useGetAllChats = (offset: number) => {
  return useQuery({
    queryFn: () => ChatService.getAllChats(offset),
    queryKey: ["conversations", offset],
  });
};

export const useTakeover = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ChatService.takeover,
    mutationKey: ["conversations", "takeover"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Human mode enabled — AI paused");
    },
  });
};

export const useSendReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      ChatService.sendReply(id, content),
    mutationKey: ["messages", "sendReply"],
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.id],
      });
      toast.success("Message sent");
    },
    onError: () => toast.error("Failed to send message"),
  });
};

export const useSendBrochure = () => {
  return useMutation({
    mutationFn: (id: number) => ChatService.sendBrochure(id),
    mutationKey: ["conversations", "sendBrochure"],
    onSuccess: () => toast.success("Brochure sent"),
    onError: () => toast.error("Failed to send brochure"),
  });
};