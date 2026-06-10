import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function StatCard({ stat, label, value, Icon }: any) {
    return (
        <Card className="border-white/[0.07] bg-card p-0 h-auto min-h-auto">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <p className="text-[12px] text-muted-foreground">{label}</p>
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-muted">
                        <Icon className="h-4 w-4 text-brand" />
                    </div>
                </div>
                <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight">{value}</p>
                <div className={`mt-2 inline-flex items-center gap-1 text-[11px] ${stat.up ? "text-brand" : "text-red-400"}`}>
                    {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.delta} <span className="text-muted-foreground">vs yesterday</span>
                </div>
            </CardContent>
        </Card>
    );
}