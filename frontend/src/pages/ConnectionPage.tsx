import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/AuthContext";
import { useGetWhatsappSettings, useSaveWhatsappSettings } from "@/api/connection/connection-api";
import { connectionFormSchema, ConnectionFormValues } from "@/schema/connection";
import FieldWrapper from "@/components/field-wrapper";

export default function ConnectionPage() {
  const { user } = useAuth();
  const [showToken, setShowToken] = useState(false);
  const webhook = "/api/v1/webhooks/whatsapp";

  // APIs Hooks
  const { data: settingsData, isLoading: settingsLoading, error: settingError } = useGetWhatsappSettings();
  const { mutateAsync: handleSubmitWhatsappSettings, isPending: isSettingPending, error: settingSaveError } = useSaveWhatsappSettings();

  // React Hook Form Configuration
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

  // Sync incoming API settings with Form State
  useEffect(() => {
    if (settingsData) {
      reset({
        phone_number_id: settingsData.phone_number_id || "",
        access_token: "", // Kept empty for edit security
        waba_id: settingsData.waba_id || "",
        display_phone_number: settingsData.display_phone_number || "",
      });
    }
  }, [settingsData, reset]);

  // Safe Side-Effect Toast Notifications
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
      // Caught gracefully by React Query error boundary setup
    }
  };

  return (
    <main className="connection-page">
      <PageHeader
        title="Connection"
        description="Connect your Meta WhatsApp Cloud API to receive and reply to customer messages."
      />
      
      <div className="px-5 pb-8 md:px-8">
        <div className="mx-auto w-full max-w-[560px] space-y-4">
          
          {/* --- STATUS BANNER WITH SOFT GLOW --- */}
          {settingsData?.is_connected && (
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-60 blur-md"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(37,211,102,0.25), rgba(37,211,102,0) 70%)",
                }}
              />
              <div className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-[#12161d] p-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand ring-4 ring-brand/5">
                    <Check className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">WhatsApp connected</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {user?.email || "rehmansheikh4146@gmail.com"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    Live
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* --- MAIN CONFIGURATION CARD --- */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12161d] shadow-2xl">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6 p-6">
                  
                  {/* Card Header Section */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-[14px] font-medium text-foreground/90">
                      WhatsApp (Meta Cloud API)
                    </h2>
                    <a
                      href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline"
                    >
                      Meta Cloud API docs
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Webhook Clipboard Box */}
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#090b0f] p-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Webhook callback URL
                      </span>
                      <code className="truncate text-[12px] text-foreground/80">{webhook}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(webhook);
                        toast.success("Webhook URL copied");
                      }}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Form Input Fields Container */}
                  <div className="space-y-4">
                    
                    {/* Phone Number ID */}
                    <FieldWrapper name="phone_number_id">
                      <Label htmlFor="phone_number_id" className="mb-2 block text-[12px] font-medium text-muted-foreground">
                        Phone Number ID
                      </Label>
                      <Input
                        id="phone_number_id"
                        type="text"
                        placeholder="From Meta Developer Console"
                        disabled={settingsLoading}
                        className="w-full rounded-xl border border-white/10 bg-[#1c2128] px-4 py-3 text-[13px] text-foreground placeholder:text-white/30 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/40"
                        {...register("phone_number_id")}
                      />
                    </FieldWrapper>

                    {/* Permanent Access Token */}
                    <FieldWrapper name="access_token">
                      <Label htmlFor="access_token" className="mb-2 block text-[12px] font-medium text-muted-foreground">
                        Permanent Access Token
                      </Label>
                      <div className="relative">
                        <Input
                          id="access_token"
                          type={showToken ? "text" : "password"}
                          placeholder={settingsData?.is_connected ? "Leave blank to keep existing" : "Required"}
                          disabled={settingsLoading}
                          className="w-full rounded-xl border border-white/10 bg-[#1c2128] px-4 py-3 text-[13px] text-foreground placeholder:text-white/30 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/40 pr-11"
                          {...register("access_token")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FieldWrapper>

                    {/* Two Column Section: WABA ID & Display Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* WABA ID */}
                      <FieldWrapper name="waba_id">
                        <Label htmlFor="waba_id" className="mb-2 block text-[12px] font-medium text-muted-foreground">
                          WABA ID <span className="text-white/40">(optional)</span>
                        </Label>
                        <Input
                          id="waba_id"
                          type="text"
                          placeholder="ID..."
                          disabled={settingsLoading}
                          className="w-full rounded-xl border border-white/10 bg-[#1c2128] px-4 py-3 text-[13px] text-foreground placeholder:text-white/30 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/40"
                          {...register("waba_id")}
                        />
                      </FieldWrapper>

                      {/* Display Phone */}
                      <FieldWrapper name="display_phone_number">
                        <Label htmlFor="display_phone_number" className="mb-2 block text-[12px] font-medium text-muted-foreground">
                          Display phone
                        </Label>
                        <Input
                          id="display_phone_number"
                          type="text"
                          placeholder="+92..."
                          disabled={settingsLoading}
                          className="w-full rounded-xl border border-white/10 bg-[#1c2128] px-4 py-3 text-[13px] text-foreground placeholder:text-white/30 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/40"
                          {...register("display_phone_number")}
                        />
                      </FieldWrapper>

                    </div>
                  </div>
                </div>

                {/* --- FOOTER ACTION BUTTON --- */}
                <div className="border-t border-white/5 bg-[#161b22]/60 p-6">
                  <Button
                    type="submit"
                    disabled={isSettingPending || settingsLoading}
                    className="h-12 w-full rounded-xl bg-brand text-[14px] font-semibold text-primary-foreground shadow-lg shadow-brand/10 transition-all hover:bg-brand/90 active:scale-[0.98]"
                  >
                    {isSettingPending ? "Saving…" : "Save connection settings"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>

        </div>
      </div>
    </main>
  );
}