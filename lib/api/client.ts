/**
 * Plain fetch wrapper for the BFF proxy (`/api/bff/*` → FastAPI `/api/v1/*`).
 * Feature `*Service.ts` modules are the only callers. Throws `ApiError` on a
 * non-2xx response, whose `.message` is the FastAPI `{detail}` string — so a
 * thunk's `.rejected` case gets it via `action.error.message` for free.
 */

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Human message for a thrown value — for direct service calls that bypass the
 * toast-error middleware (e.g. blob downloads). */
export function errorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return "Something went wrong";
}

function detailFrom(body: unknown, status: number): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // FastAPI 422 validation payload
      const msgs = detail
        .map((d) => (d && typeof d === "object" ? (d as { msg?: string }).msg : null))
        .filter(Boolean);
      if (msgs.length) return msgs.join("; ");
    }
  }
  if (status === 401) return "Your session has expired. Please sign in again.";
  return `Request failed (${status})`;
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`/api/bff/${path.replace(/^\//, "")}`, {
    credentials: "include",
    ...init,
    headers: {
      accept: "application/json",
      ...(isForm ? {} : { "content-type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ats:session-expired"));
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    if (!res.ok) throw new ApiError(res.status, detailFrom(null, res.status));
    return undefined as T;
  }

  const text = await res.text();
  const body = text ? safeJson(text) : null;

  if (!res.ok) throw new ApiError(res.status, detailFrom(body, res.status));
  return body as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Read `path` as a Blob (for résumé download etc.). */
export async function apiBlob(path: string): Promise<Blob> {
  const res = await fetch(`/api/bff/${path.replace(/^\//, "")}`, {
    credentials: "include",
    headers: { accept: "*/*" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, detailFrom(safeJson(text), res.status));
  }
  return res.blob();
}
