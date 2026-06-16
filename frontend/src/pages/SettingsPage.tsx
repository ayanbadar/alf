import * as React from "react";
import { User, Building2, Palette } from "lucide-react";
import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeSelector } from "@/components/theme-selector";

import { useAuth } from "@/context/AuthContext";
import { useUpdateUser } from "@/api/auth/auth-api";
import { profileSchema, ProfileSchemaType } from "@/schema/profile";
import FieldWrapper from "@/components/field-wrapper";
import { cn } from "@/lib/utils";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

const inputStyles =
  "h-10 border-white/[0.06] bg-[#1e2530] text-[13px] shadow-none focus-visible:ring-1 focus-visible:ring-brand/50 focus-visible:border-brand/40 disabled:opacity-60 disabled:cursor-not-allowed";

export default function SettingsPage() {
  const { user } = useAuth();
  const [active, setActive] = React.useState<string>("profile");

  // React Hook Form Configuration
  const methods = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.full_name ?? "" }
  });

  const { register, handleSubmit, watch, reset } = methods;
  const fullName = watch("fullName") ?? "";

  // Update User Query Hooks
  const { mutateAsync: handleUpdateUserAsync, isPending: userUpdatePending } = useUpdateUser();

  // Reset form if initial server data loads post-mount
  React.useEffect(() => {
    if (user?.full_name) {
      reset({ fullName: user.full_name });
    }
  }, [user?.full_name, reset]);

  // Intersection Observer for Sidebar Highlights
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (data: ProfileSchemaType) => {
    try {
      await handleUpdateUserAsync({ full_name: data.fullName });
      toast.success("Full Name Updated Successfully");
    } catch (e) {
      // Handled beautifully via API error structures
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Settings" description="Your profile, agency details, and app preferences." />

      <div>
        <div className="grid max-w-260 grid-cols-1 gap-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10 items-start">

          {/* --- STICKY SIDEBAR NAV --- */}
          {/* Sticky sidebar nav */}
          <aside className="hidden self-start md:block h-fit sticky top-6">
            <nav className="flex flex-col gap-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 px-3">
                Sections
              </p>
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-brand/10 text-brand"
                        : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* --- MAIN MAIN CONTENT BLOCK --- */}
          <div className="min-w-0 space-y-10">

            {/* 1. PROFILE SECTION */}
            <Section
              id="profile"
              icon={User}
              title="Profile"
              description="Update how your name appears across the dashboard."
            >
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>

                  {/* Display Name Row (Writable Input) */}
                  <Row label="Display name" hint="Shown on activity and replies.">
                    <FieldWrapper name="fullName">
                      <Input
                        id="full_name"
                        placeholder="Your name"
                        className={inputStyles}
                        {...register("fullName")}
                      />
                    </FieldWrapper>
                  </Row>

                  <Divider />

                  {/* Email Row (ReadOnly) */}
                  <Row label="Email" hint="Used for sign-in and notifications.">
                    <Input disabled value={user.email} className={inputStyles} readOnly />
                  </Row>

                  <Divider />

                  {/* Role Badge Row */}
                  <Row label="Role" hint="Your access level in this workspace.">
                    <div className="flex h-10 items-center">
                      <Badge variant="brand" className="rounded-full px-3 py-1 text-[11px] capitalize">
                        {user.role || "Owner"}
                      </Badge>
                    </div>
                  </Row>

                  {/* Section Save Actions */}
                  <SectionFooter
                    label="Save profile"
                    isPending={userUpdatePending}
                    isDisabled={fullName.trim() === "" || fullName.trim() === user.full_name}
                  />
                </form>
              </FormProvider>
            </Section>

            {/* 2. ORGANIZATION SECTION (READ ONLY) */}
            <Section
              id="organization"
              icon={Building2}
              title="Organization"
              description="Your agency workspace on ALF. Contact support to change these."
              badge={<Badge variant="muted" className="text-[10px] bg-white/4 text-muted-foreground border-white/5">Read-only</Badge>}
            >
              {/* Agency Name Row */}
              <Row label="Agency name">
                <Input disabled value={user.organization_name || "N/A"} className={inputStyles} readOnly />
              </Row>

              <Divider />

              {/* Workspace ID Row */}
              <Row label="Workspace ID">
                <Input disabled value={String(user.organization_id || "")} className={cn(inputStyles, "font-mono")} readOnly />
              </Row>

              {user.organization_slug && (
                <>
                  <Divider />
                  {/* Custom Organization Slug Row */}
                  <Row label="Slug">
                    <div className="flex items-center gap-0">
                      <span className="flex h-10 items-center rounded-l-md border border-r-0 border-white/6 bg-[#161b22] px-3 text-[12px] text-muted-foreground">
                        alf.app/
                      </span>
                      <Input
                        disabled
                        value={user.organization_slug}
                        className={cn(inputStyles, "rounded-l-none font-mono")}
                        readOnly
                      />
                    </div>
                  </Row>
                </>
              )}

              {user.organization_timezone && (
                <>
                  <Divider />
                  {/* Timezone Settings Row */}
                  <Row label="Timezone">
                    <Input disabled value={user.organization_timezone} className={inputStyles} readOnly />
                  </Row>
                </>
              )}
            </Section>

            {/* 3. APPEARANCE SECTION */}
            <Section
              id="appearance"
              icon={Palette}
              title="Appearance"
              description="Light, dark, or match your device system config options."
            >
              <Row label="Theme preference" hint="Switch theme modes easily across clients.">
                <div className="py-2">
                  <ThemeSelector />
                </div>
              </Row>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER WRAPPER COMPONENTS FOR UI SEGMENTS ---

function Section({
  id,
  icon: Icon,
  title,
  description,
  badge,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-xl border border-white/6 bg-card overflow-hidden">
      <header className="flex items-start gap-3 border-b border-white/5 px-5 py-4 md:px-6">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[14px] font-semibold tracking-tight text-foreground">{title}</h2>
            {badge}
          </div>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="px-5 py-2 md:px-6">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
  align = "center",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6",
        align === "start" ? "sm:items-start" : "sm:items-center",
      )}
    >
      <div className="min-w-0">
        <Label className="text-[13px] font-medium text-foreground">{label}</Label>
        {hint && <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-white/5" />;
}

function SectionFooter({ label, isPending, isDisabled }: { label: string; isPending: boolean; isDisabled: boolean }) {
  return (
    <div className="-mx-5 mt-2 flex items-center justify-end gap-2 border-t border-white/[0.05] px-5 py-3 md:-mx-6 md:px-6 bg-[#161b22]/30">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        size="sm"
        disabled={isDisabled || isPending}
        className="bg-brand text-primary-foreground shadow-[0_4px_14px_-4px_rgba(37,211,102,0.45)] hover:bg-brand/90 transition-all disabled:opacity-50"
      >
        {isPending ? "Saving…" : label}
      </Button>
    </div>
  );
}