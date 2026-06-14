import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
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
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/context/AuthContext";
import { useGetWhatsappSettings, useSaveWhatsappSettings } from "@/api/connection/connection-api";
import { connectionFormSchema, ConnectionFormValues } from "@/schema/connection";
import FieldWrapper from "@/components/field-wrapper";

export default function ConnectionPage() {
  const { user } = useAuth();

  // APIs
  const { data: settingsData, isLoading: settingsLoading, error: settingError } = useGetWhatsappSettings();
  const { mutateAsync: handleSubmitWhatsappSettings, isPending: isSettingPending, error: settingSaveError } = useSaveWhatsappSettings();

  const methods = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      phone_number_id: "",
      access_token: "",
      waba_id: "",
      display_phone_number: "",
    },
  });

  const { register, handleSubmit, reset } = methods;

  useEffect(() => {
    if (settingsData) {
      reset({
        phone_number_id: settingsData.phone_number_id || "",
        access_token: "",
        waba_id: settingsData.waba_id || "",
        display_phone_number: settingsData.display_phone_number || "",
      });
    }
  }, [settingsData, reset]);

  // Toast Alerts
  useEffect(() => {
    if (settingError) toast.error(settingError.toString());
  }, [settingError]);

  useEffect(() => {
    if (settingSaveError) toast.error(settingSaveError.toString());
  }, [settingSaveError]);

  // Submit Handler
  const onSubmit = async (values: ConnectionFormValues) => {
    try {
      await handleSubmitWhatsappSettings({
        ...values,
        is_connected: settingsData?.is_connected || true,
      });
      toast.success("Settings Saved Successfully!");
    } catch (e) {
      // Handled via state/hooks error mechanisms
    }
  };

  return (
    <main className="connection-page">
      <PageHeader
        title="Connection"
        description="Connect your Meta WhatsApp Cloud API to receive and reply to customer messages."
      />
      <div className="mx-auto max-w-139.5 w-full">
        {settingsData?.is_connected && (
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

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">

                {/* --- PHONE NUMBER ID --- */}
                <FieldWrapper name="phone_number_id">
                  <Label htmlFor="phone_number_id">Phone Number ID</Label>
                  <Input
                    id="phone_number_id"
                    placeholder="From Meta Developer Console"
                    disabled={settingsLoading}
                    {...register("phone_number_id")}
                  />
                </FieldWrapper>

                {/* --- ACCESS TOKEN --- */}
                <FieldWrapper name="access_token">
                  <Label htmlFor="access_token">Permanent Access Token</Label>
                  <Input
                    id="access_token"
                    type="password"
                    placeholder={settingsData?.is_connected ? "Leave blank to keep existing" : "Required"}
                    disabled={settingsLoading}
                    {...register("access_token")}
                  />
                </FieldWrapper>

                {/* --- WABA ID --- */}
                <FieldWrapper name="waba_id">
                  <Label htmlFor="waba_id">WABA ID (optional)</Label>
                  <Input
                    id="waba_id"
                    placeholder="Enter WhatsApp Business Account ID"
                    disabled={settingsLoading}
                    {...register("waba_id")}
                  />
                </FieldWrapper>

                {/* --- DISPLAY PHONE NUMBER --- */}
                <FieldWrapper name="display_phone_number">
                  <Label htmlFor="display_phone_number">Display phone</Label>
                  <Input
                    id="display_phone_number"
                    placeholder="+92..."
                    disabled={settingsLoading}
                    {...register("display_phone_number")}
                  />
                </FieldWrapper>

              </CardContent>

              <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button type="submit" disabled={isSettingPending || settingsLoading}>
                  {isSettingPending ? "Saving…" : "Save connection"}
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
          </FormProvider>
        </Card>
      </div>
    </main>
  );
}