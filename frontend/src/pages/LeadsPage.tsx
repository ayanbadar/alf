import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useListPagination } from "@/hooks/use-list-pagination";
import { api } from "@/api/client";
import { type PaginatedResponse, paginatedUrl } from "@/lib/pagination";

interface Lead {
  id: number;
  phone: string;
  name: string | null;
  requirement: string | null;
  budget: string | null;
  project_interest: string | null;
  status: string;
  created_at: string;
}

const statuses = ["new", "contacted", "won", "lost"] as const;

export default function LeadsPage() {
  const { offset, setOffset } = useListPagination();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["leads", offset],
    queryFn: () => api<PaginatedResponse<Lead>>(paginatedUrl("/leads", offset)),
  });

  const leads = data?.items ?? [];
  const total = data?.total ?? 0;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api<Lead>(`/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Prospects captured from WhatsApp — budget, requirements, and pipeline status."
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Connect WhatsApp in Connection. Leads appear when customers share contact details or requirements."
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                    <TableCell>{lead.name || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {lead.requirement || "—"}
                    </TableCell>
                    <TableCell>{lead.budget || "—"}</TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(status) =>
                          updateStatus.mutate({ id: lead.id, status: status ?? lead.status })
                        }
                      >
                        <SelectTrigger className="w-[130px] capitalize" size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ListPagination offset={offset} total={total} onOffsetChange={setOffset} />
        </div>
      )}
    </div>
  );
}
