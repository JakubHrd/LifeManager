import { buildAuthHeaders } from "../../../services/authHeaders";

export type ActivityApiOptions = {
  credentials?: RequestCredentials; // 'include' by default
  headers?: Record<string, string>; // extra hlavičky (přepíší defaulty)
};

export class ActivityApi {
  basePath: string;
  credentials: RequestCredentials;
  headers: Record<string, string>;

  constructor(basePath: string, options: ActivityApiOptions = {}) {
    this.basePath = basePath;
    this.credentials = options.credentials ?? "include";
    this.headers = options.headers ?? {};
  }

  private buildUrl(params?: Record<string, any>) {
    const url = new URL(this.basePath, window.location.origin);
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    return url.toString();
  }

  private async request<T = any>(
    method: "GET" | "PUT" | "POST" | "DELETE",
    params?: Record<string, any>,
    body?: any
  ): Promise<T> {
    const url = this.buildUrl(params);

    const auth = buildAuthHeaders(); // <<<< zde se přidá Bearer token
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...auth,
      ...this.headers,
    };

    const res = await fetch(url, {
      method,
      credentials: this.credentials,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(msg || `HTTP ${res.status}`);
    }

    const text = await res.text().catch(() => "");
    return (text ? JSON.parse(text) : ({} as any)) as T;
  }

  get<T = any>(params?: Record<string, any>) { return this.request<T>("GET", params); }
  put<T = any>(params: Record<string, any> | undefined, body: any) { return this.request<T>("PUT", params, body); }
  post<T = any>(params: Record<string, any> | undefined, body: any) { return this.request<T>("POST", params, body); }
  delete<T = any>(params?: Record<string, any>) { return this.request<T>("DELETE", params); }
}
