import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE, pageRange, totalPages } from "@/lib/pagination";

interface ListPaginationProps {
  offset: number;
  total: number;
  limit?: number;
  onOffsetChange: (offset: number) => void;
  compact?: boolean;
}

export function ListPagination({
  offset,
  total,
  limit = PAGE_SIZE,
  onOffsetChange,
  compact = false,
}: ListPaginationProps) {
  if (total === 0) return null;

  const pages = totalPages(total, limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const { from, to } = pageRange(offset, limit, total);
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          disabled={!canPrev}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-center text-xs text-muted-foreground">
          {from}–{to} of {total}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          disabled={!canNext}
          onClick={() => onOffsetChange(offset + limit)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="min-w-[5rem] text-center text-sm text-muted-foreground">
          Page {currentPage} of {pages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onOffsetChange(offset + limit)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
