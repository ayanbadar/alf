import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/40",
        className
      )}
    >
      <div className="border-b border-border/40 px-8 pt-8 pb-6">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="px-8 py-6">{children}</div>
      {footer && (
        <div className="border-t border-border/40 bg-muted/30 px-8 py-6">{footer}</div>
      )}
    </div>
  );
}
