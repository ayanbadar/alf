import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Hand, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useListPagination } from "@/hooks/use-list-pagination";
import { api } from "@/api/client";
import { type PaginatedResponse, paginatedUrl } from "@/lib/pagination";

interface Conversation {
  id: number;
  contact_wa_id: string;
  contact_name: string | null;
  human_mode: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
}

interface Message {
  id: number;
  direction: string;
  sender: string;
  content: string;
  created_at: string;
}

const senderStyles: Record<string, string> = {
  customer: "bg-muted mr-auto rounded-bl-sm",
  ai: "bg-primary/15 text-foreground ml-auto rounded-br-sm border border-primary/20",
  agent: "bg-blue-500/15 ml-auto rounded-br-sm border border-blue-500/20",
};

export default function ChatsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const { offset, setOffset } = useListPagination();
  const qc = useQueryClient();

  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations", offset],
    queryFn: () =>
      api<PaginatedResponse<Conversation>>(paginatedUrl("/conversations", offset)),
  });

  const conversations = conversationsData?.items ?? [];
  const conversationsTotal = conversationsData?.total ?? 0;

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => api<Message[]>(`/conversations/${selectedId}/messages`),
    enabled: !!selectedId,
  });

  const takeover = useMutation({
    mutationFn: (id: number) =>
      api(`/conversations/${id}/takeover`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Human mode enabled — AI paused");
    },
  });

  const sendReply = useMutation({
    mutationFn: () =>
      api(`/conversations/${selectedId}/reply`, {
        method: "POST",
        body: JSON.stringify({ content: reply }),
      }),
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["messages", selectedId] });
      toast.success("Message sent");
    },
    onError: () => toast.error("Failed to send message"),
  });

  const sendBrochure = useMutation({
    mutationFn: () =>
      api(`/conversations/${selectedId}/send-brochure`, { method: "POST" }),
    onSuccess: () => toast.success("Brochure sent"),
    onError: () => toast.error("Failed to send brochure"),
  });

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <PageHeader
        title="Chats"
        description="Monitor WhatsApp threads, take over from AI, or send brochures."
      />

      <div className="flex min-h-0 flex-1 gap-4">
        <Card className="flex w-80 shrink-0 flex-col overflow-hidden py-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">Conversations</p>
            <p className="text-xs text-muted-foreground">
              {conversationsTotal} thread{conversationsTotal !== 1 ? "s" : ""}
            </p>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            {loadingConversations ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : conversationsTotal === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet. Connect WhatsApp in Connection.
              </p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    selectedId === c.id && "bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {c.contact_name || c.contact_wa_id}
                    </p>
                    {c.human_mode && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Human
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {c.last_message_preview || "No messages"}
                  </p>
                </button>
              ))
            )}
          </ScrollArea>
          {conversationsTotal > 0 && (
            <div className="border-t p-2">
              <ListPagination
                compact
                offset={offset}
                total={conversationsTotal}
                onOffsetChange={setOffset}
              />
            </div>
          )}
        </Card>

        <Card className="flex min-w-0 flex-1 flex-col overflow-hidden py-0">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {selected.contact_name || selected.contact_wa_id}
                  </p>
                  <p className="text-xs text-muted-foreground">{selected.contact_wa_id}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => takeover.mutate(selected.id)}
                  disabled={takeover.isPending || selected.human_mode}
                >
                  <Hand className="size-4" />
                  Take over
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => sendBrochure.mutate()}
                  disabled={sendBrochure.isPending}
                >
                  <FileText className="size-4" />
                  Send brochure
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4 py-4">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-2/3 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                          senderStyles[m.sender] ?? senderStyles.agent
                        )}
                      >
                        <span className="mb-1 block text-xs font-medium capitalize text-muted-foreground">
                          {m.sender}
                        </span>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <Separator />
              <div className="flex gap-2 p-4">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply as agent…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && reply.trim()) {
                      e.preventDefault();
                      sendReply.mutate();
                    }
                  }}
                />
                <Button
                  onClick={() => sendReply.mutate()}
                  disabled={!reply.trim() || sendReply.isPending}
                >
                  <Send className="size-4" />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              className="m-4 flex-1 border-0"
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a thread from the list to view messages and reply as an agent."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
