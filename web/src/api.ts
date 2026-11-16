/**
 * Cliente HTTP da API Fastify (pasta /api).
 * Rotas reais: /rules, /services, /appointments.
 * POST/PUT/DELETE exigem o header x-api-key (igual ao API_KEY do .env da API).
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
const KEY = import.meta.env.VITE_API_KEY as string | undefined;

export const apiEnabled = Boolean(BASE);

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (KEY) headers["x-api-key"] = KEY;
  // Fastify rejeita Content-Type JSON com corpo vazio (ex.: DELETE), então só enviamos com corpo.
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const d = data as { error?: unknown; message?: unknown } | undefined;
    const msg = typeof d?.error === "string" ? d.error : typeof d?.message === "string" ? d.message : `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

function safeJson(t: string): unknown {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

export const api = {
  get: <T,>(path: string) => request<T>("GET", path),
  post: <T,>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T,>(path: string, body: unknown) => request<T>("PUT", path, body),
  del: <T,>(path: string) => request<T>("DELETE", path),
};

export const routes = {
  rules: "/api/v1/rules",
  services: "/api/v1/services",
  appointments: "/api/v1/appointments",
};

/** Aceita tanto um array puro quanto { data: [...] } / { rules: [...] } etc. */
export function unwrapList<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    for (const k of [...keys, "data", "items"]) {
      const v = (payload as Record<string, unknown>)[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}
