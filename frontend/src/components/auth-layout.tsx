import { Building2, MessageCircle, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const highlights = [
  { icon: MessageCircle, text: "Instant Urdu & English WhatsApp replies" },
  { icon: Sparkles, text: "Answers grounded in your brochures & price lists" },
  { icon: Building2, text: "Built for Pakistani real-estate agencies" },
];

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(0_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0_0_0/0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,oklch(1_0_0/0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.03)_1px,transparent_1px)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,oklch(0.55_0.1_165/0.12),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1fr_420px] lg:gap-16 xl:gap-24">
        <div className="hidden flex-col justify-between px-8 py-12 lg:flex lg:px-12 lg:py-16">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <MessageCircle className="size-5" strokeWidth={2.25} />
              </div>
              <span className="text-lg font-semibold tracking-tight">ALF</span>
            </div>
            <h1 className="mt-12 max-w-md text-4xl font-semibold leading-[1.15] tracking-tight text-balance">
              Your AI employee on WhatsApp
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
              Capture leads, book site visits, and reply from your knowledge base — without
              hallucinating prices or project details.
            </p>
          </div>

          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-8 lg:py-16">
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
