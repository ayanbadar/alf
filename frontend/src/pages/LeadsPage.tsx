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
import { useGetAllLeads, useUpdateLeadById } from "@/api/leads/leads-api";
import { toast } from "sonner";
import { statuses } from "@/types/leads";

export default function LeadsPage() {
  const { offset, setOffset } = useListPagination();
  const { data: leadsData, isLoading: isLeadsLoading } = useGetAllLeads(offset);
  const { mutateAsync: handleUpdateLeadStatus, isPending: isLeadStatusPending, isSuccess: isLeadSuccess } = useUpdateLeadById();

  const handleValueChange = ({ id, status }: { id: number, status: string }) => {
    handleUpdateLeadStatus({ id, status });
  };

  if (isLeadSuccess) {
    toast.success("Lead Status Updated Successfully!");
  };

  const leads = leadsData?.items ?? [];
  const total = leadsData?.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Prospects captured from WhatsApp — budget, requirements, and pipeline status."
      />

      {(isLeadsLoading || isLeadStatusPending) ? (
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
                {leads?.map((lead) => (
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
                        onValueChange={(status) => handleValueChange({ id: lead.id, status: status || lead.status })}
                      >
                        <SelectTrigger className="w-32.5 capitalize" size="sm">
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
