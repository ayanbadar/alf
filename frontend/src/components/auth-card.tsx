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
        "rounded-2xl border border-white/[0.07] bg-card p-6 md:p-8",
        className
      )}
    >
      <div>
        <h2 className="text-[18px] font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="px-0 py-0">{children}</div>
      {footer && (
        <div className="border-t border-border/40">{footer}</div>
      )}
    </div>
  );
}
