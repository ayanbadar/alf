import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  MessageSquare,
  Percent,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api/client";
import { cn } from "@/lib/utils";

interface Stats {
  leads_today: number;
  messages_today: number;
  appointments_today: number;
  total_leads: number;
  conversion_rate: number;
}

const statConfig = [
  { key: "leads_today" as const, label: "Leads today", icon: UserPlus },
  { key: "messages_today" as const, label: "Messages today", icon: MessageSquare },
  { key: "appointments_today" as const, label: "Appointments today", icon: CalendarCheck },
  { key: "total_leads" as const, label: "Total leads", icon: Users },
  { key: "conversion_rate" as const, label: "Conversion rate", icon: Percent, format: (v: number) => `${v}%` },
];

export default function OverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api<Stats>("/dashboard/stats"),
  });

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Today's activity across WhatsApp conversations, leads, and site visits."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-16" />
                </CardContent>
              </Card>
            ))
          : statConfig.map((stat, i) => {
              const Icon = stat.icon;
              const raw = data?.[stat.key] ?? 0;
              const value = stat.format ? stat.format(raw as number) : raw;
              return (
                <Card
                  key={stat.key}
                  className={cn(
                    "transition-shadow hover:shadow-md",
                    i === 0 && "border-primary/30"
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
