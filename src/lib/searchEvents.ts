export const OPEN_SEARCH_EVENT = "zakeem:open-global-search";

export function openGlobalSearch(initialQuery?: unknown): void {
  const query = typeof initialQuery === "string" ? initialQuery : undefined;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail: { query } }));
  }
}
