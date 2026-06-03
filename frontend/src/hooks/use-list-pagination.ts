import { useState } from "react";
import { PAGE_SIZE } from "@/lib/pagination";

export function useListPagination(initialOffset = 0) {
  const [offset, setOffset] = useState(initialOffset);
  return {
    offset,
    limit: PAGE_SIZE,
    setOffset,
    reset: () => setOffset(0),
  };
}
