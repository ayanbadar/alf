import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

interface WhatsAppSettings {
  phone_number_id: string | null;
  waba_id: string | null;
  display_phone_number: string | null;
  is_connected: boolean;
}

export default function ConnectionPage() {
  const [form, setForm] = useState({
    phone_number_id: "",
    access_token: "",
    waba_id: "",
    display_phone_number: "",
  });

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp-settings"],
    queryFn: () => api<WhatsAppSettings>("/settings/whatsapp"),
  });

  const save = useMutation({
    mutationFn: () =>
      api<WhatsAppSettings>("/settings/whatsapp", {
        method: "PUT",
        body: JSON.stringify({
          phone_number_id: form.phone_number_id,
          access_token: form.access_token,
          waba_id: form.waba_id || null,
          display_phone_number: form.display_phone_number || null,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp-settings"] });
      toast.success("WhatsApp connection saved");
    },
    onError: () => toast.error("Failed to save connection"),
  });

  const { user } = useAuth();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <main className="connection-page">
      <PageHeader
        title="Connection"
        description="Connect your Meta WhatsApp Cloud API to receive and reply to customer messages."
      />
      <div className="mx-auto max-w-139.5 w-full">
        {data?.is_connected && (
          <Card className="border-[rgba(37,211,102,0.25)] py-0 h-17.5 bg-[var(--brand-muted)] mb-5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">WhatsApp connected</p>
                <p className="truncate text-[12px] text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="brand">Live</Badge>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp (Meta Cloud API)</CardTitle>
            <CardDescription>
              Webhook callback URL:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-primary">
                /api/v1/webhooks/whatsapp
              </code>
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number_id">Phone Number ID</Label>
                <Input
                  id="phone_number_id"
                  placeholder="From Meta Developer Console"
                  value={form.phone_number_id || data?.phone_number_id || ""}
                  onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_token">Permanent Access Token</Label>
                <Input
                  id="access_token"
                  type="password"
                  placeholder={data?.is_connected ? "Leave blank to keep existing" : "Required"}
                  value={form.access_token}
                  onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                  required={!data?.is_connected}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waba_id">WABA ID (optional)</Label>
                <Input
                  id="waba_id"
                  value={form.waba_id || data?.waba_id || ""}
                  onChange={(e) => setForm({ ...form, waba_id: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_phone">Display phone</Label>
                <Input
                  id="display_phone"
                  placeholder="+92..."
                  value={form.display_phone_number || data?.display_phone_number || ""}
                  onChange={(e) =>
                    setForm({ ...form, display_phone_number: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button type="submit" disabled={save.isPending || isLoading}>
                {save.isPending ? "Saving…" : "Save connection"}
              </Button>
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Meta Cloud API docs
                <ExternalLink className="size-3.5" />
              </a>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
