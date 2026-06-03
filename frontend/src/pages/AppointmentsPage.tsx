import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Phone } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ListPagination } from "@/components/list-pagination";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPagination } from "@/hooks/use-list-pagination";
import { api } from "@/api/client";
import { type PaginatedResponse, paginatedUrl } from "@/lib/pagination";

interface Appointment {
  id: number;
  scheduled_at: string;
  project: string | null;
  notes: string | null;
  status: string;
  contact_phone: string | null;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  scheduled: "default",
  confirmed: "default",
  completed: "secondary",
  cancelled: "outline",
};

export default function AppointmentsPage() {
  const { offset, setOffset } = useListPagination();
  const { data, isLoading } = useQuery({
    queryKey: ["appointments", offset],
    queryFn: () =>
      api<PaginatedResponse<Appointment>>(paginatedUrl("/appointments", offset)),
  });

  const appointments = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Site visits and meetings booked via WhatsApp (Pakistan timezone)."
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments scheduled"
          description="When customers book site visits (e.g. “kal 11 baje”), they appear here automatically."
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {appointments.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Calendar className="size-4 text-primary shrink-0" />
                      {new Date(a.scheduled_at).toLocaleString("en-PK", {
                        timeZone: "Asia/Karachi",
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      {a.project || "Site visit"}
                    </p>
                    {a.contact_phone && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="size-3.5 shrink-0" />
                        {a.contact_phone}
                      </p>
                    )}
                    {a.notes && (
                      <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">
                        {a.notes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={statusVariant[a.status] ?? "secondary"}
                    className="w-fit capitalize"
                  >
                    {a.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <ListPagination offset={offset} total={total} onOffsetChange={setOffset} />
        </div>
      )}
    </div>
  );
}
