import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import StatCard from "@/components/state-card";
import { activity, chartData, replyMix, stats } from "@/constants";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Separator } from "@base-ui/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Stats } from "@/types/dashboard";

export default function OverviewPage() {
  const [aiOn, setAiOn] = useState<boolean>(true);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api<Stats>("/dashboard/stats"),
  });

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Today's activity across WhatsApp conversations, leads, and site visits."
        action={<Badge variant="muted" className="hidden sm:inline-flex">Today - Pakistan</Badge>}
      />
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] bg-card px-4 py-3">
        <span className="pulse-dot relative h-2 w-2 rounded-full bg-brand" />
        <p className="text-[13px]">
          <span className="font-medium">AI is handling</span>{" "}
          <span className="text-muted-foreground">all WhatsApp conversations</span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">AI replies</span>
          <Switch checked={aiOn} onCheckedChange={setAiOn} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16" />
              </CardContent>
            </Card>
          ))
          : stats.map((stat) => {
            const Icon = stat.icon;
            const raw = data?.[stat.key as keyof Stats] ?? 0;
            const value = stat.format ? stat.format(raw as number) : raw;
            return <StatCard Icon={Icon} key={stat.label} label={stat.label} stat={stat} value={value} />
          })}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="border-white/[0.07] bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-medium">Last 7 days</CardTitle>
            <p className="text-[11px] text-muted-foreground">Messages and leads volume</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      background: "#1e2530",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="messages" fill="#25D366" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" fill="#128C7E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.07] bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px] font-medium">Reply mix</CardTitle>
            <p className="text-[11px] text-muted-foreground">AI vs human responses today</p>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={replyMix} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {replyMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(v) => <span className="text-[12px] text-muted-foreground">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-3 pb-0 gap-0 border-white/[0.07] bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-[14px] font-medium">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            <ul className="px-5 py-1">
              {activity.map((a, i) => {
                const Icon = a.icon;
                return (
                  <li key={i}>
                    <div className="flex items-start gap-3 py-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-muted">
                        <Icon className="h-4 w-4 text-brand" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-medium">{a.title}</p>
                          {a.badge && (
                            <Badge
                              variant={a.badge === "Confirmed" ? "brand" : a.badge === "Qualified" ? "warm" : "info"}
                              className="text-[10px]"
                            >
                              {a.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground">
                          <span className="text-foreground/70">{a.meta}</span> - {a.text}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{a.time}</span>
                    </div>
                    {i < activity.length - 1 && <Separator className="bg-white/5" />}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
