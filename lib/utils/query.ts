/**
 * Translation between URL search params, table UI state, and the query params
 * the FastAPI list endpoints understand:
 *   - `fastapi-pagination`     → ?page= &size=
 *   - `fastapi-querybuilder`   → ?search= &sort=field:dir &filters={json}
 */

export interface SortState {
  id: string;
  desc: boolean;
}

export interface TableQuery {
  page: number;
  size: number;
  search: string;
  sort: SortState | null;
  /** column id → selected value (empty string = no filter). */
  filters: Record<string, string>;
}

export const DEFAULT_PAGE_SIZE = 20;

export function parseTableQuery(
  params: URLSearchParams,
  opts: { filterKeys?: string[]; defaultSize?: number } = {},
): TableQuery {
  const filters: Record<string, string> = {};
  for (const key of opts.filterKeys ?? []) {
    const v = params.get(`f_${key}`);
    if (v) filters[key] = v;
  }

  const sortRaw = params.get("sort");
  let sort: SortState | null = null;
  if (sortRaw) {
    const [id, dir] = sortRaw.split(":");
    if (id) sort = { id, desc: dir === "desc" };
  }

  return {
    page: Math.max(1, Number(params.get("page")) || 1),
    size: Number(params.get("size")) || opts.defaultSize || DEFAULT_PAGE_SIZE,
    search: params.get("q") ?? "",
    sort,
    filters,
  };
}

/** Serialize a TableQuery back into URL search params (for `router.push`). */
export function tableQueryToSearchParams(q: TableQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.page > 1) p.set("page", String(q.page));
  if (q.size !== DEFAULT_PAGE_SIZE) p.set("size", String(q.size));
  if (q.search) p.set("q", q.search);
  if (q.sort) p.set("sort", `${q.sort.id}:${q.sort.desc ? "desc" : "asc"}`);
  for (const [k, v] of Object.entries(q.filters)) {
    if (v) p.set(`f_${k}`, v);
  }
  return p;
}

/**
 * Build the backend query params. `filterOps` maps a filter column id to the
 * querybuilder operator to use (default `$eq`).
 */
export function buildBackendParams(
  q: TableQuery,
  filterOps: Record<string, "$eq" | "$contains"> = {},
  fixedFilters: Record<string, unknown> = {},
): URLSearchParams {
  const p = new URLSearchParams();
  p.set("page", String(q.page));
  p.set("size", String(q.size));
  if (q.search) p.set("search", q.search);
  if (q.sort) p.set("sort", `${q.sort.id}:${q.sort.desc ? "desc" : "asc"}`);

  const json: Record<string, unknown> = { ...fixedFilters };
  for (const [k, v] of Object.entries(q.filters)) {
    if (v) json[k] = { [filterOps[k] ?? "$eq"]: v };
  }
  if (Object.keys(json).length) p.set("filters", JSON.stringify(json));
  return p;
}
