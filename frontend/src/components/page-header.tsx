interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pb-5">
      <div className="min-w-0">
        <h1 className="truncate text-[20px] font-semibold tracking-tight text-foreground md:text-[22px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}