import serverUrl, { USE_COOKIE_AUTH } from "@/config";

const BASE = serverUrl; // "" v dev => relativní /api..., plná URL v prod
const credentialsOpt: RequestCredentials = USE_COOKIE_AUTH ? "include" : "omit";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  // hlavičky
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  // token (Bearer)
  const token = localStorage.getItem("token");
  if (token && !headers.has("Authorization") && !USE_COOKIE_AUTH) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: credentialsOpt,
  });

  // 401 → shodíme token + vyhodíme specifickou chybu
  if (res.status === 401) {
    localStorage.removeItem("token");
    try { const text = await res.text(); throw new UnauthorizedError(text || "Unauthorized"); }
    catch { throw new UnauthorizedError(); }
  }

  // pokus o JSON, i když BE vrátí prázdno
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
