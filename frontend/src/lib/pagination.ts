export const PAGE_SIZE = 10;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export function paginatedUrl(path: string, offset: number, limit = PAGE_SIZE): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}limit=${limit}&offset=${offset}`;
}

export function pageRange(offset: number, limit: number, total: number) {
  if (total === 0) return { from: 0, to: 0 };
  return { from: offset + 1, to: Math.min(offset + limit, total) };
}

export function totalPages(total: number, limit: number) {
  return Math.max(1, Math.ceil(total / limit));
}
