import { Building2, MessageCircle, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-svh bg-background">
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,211,102,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,211,102,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-0 h-100 w-150 rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(closest-side, #25D366, transparent)" }}
      />

      <div className="relative mx-auto grid min-h-svh max-w-6xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand text-white shadow-[0_0_24px_rgba(37,211,102,0.4)]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="text-[18px] font-semibold">ALF</p>
          </div>
          <h1 className="mt-10 text-[44px] font-semibold leading-[1.05] tracking-tight">
            Your AI employee<br />on WhatsApp
          </h1>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Capture leads, book site visits, and reply from your knowledge base — without hallucinating prices or project details.
          </p>
          <ul className="mt-10 space-y-4 text-[13px]">
            {[
              { icon: MessageCircle, text: "Instant Urdu & English WhatsApp replies" },
              { icon: Sparkles, text: "Answers grounded in your brochures & price lists" },
              { icon: Building2, text: "Built for Pakistani real-estate agencies" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-muted">
                  <f.icon className="h-3.5 w-3.5 text-brand" />
                </div>
                <span className="text-foreground/80">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
              <MessageCircle className="size-6" strokeWidth={2.25} />
            </div>
            <p className="text-lg font-semibold tracking-tight">ALF</p>
            <p className="mt-1 text-sm text-muted-foreground">
              AI WhatsApp employee for real estate
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
