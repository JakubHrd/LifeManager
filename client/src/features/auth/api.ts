import serverUrl from "../../config";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { username: string; email: string; password: string };
export type UserProfile = { id: string; username: string; email: string };

export async function loginApi(body: LoginPayload): Promise<{ token?: string }> {
  const res = await fetch(`${serverUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // v DEV přes proxy credentials nepotřebuješ; nech { } pokud jedeš čistě bearer token
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Login failed");
  return { token: data?.token };
}

export async function registerApi(body: RegisterPayload): Promise<void> {
  const res = await fetch(`${serverUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d?.message || "Register failed");
  }
}

export async function meApi(): Promise<UserProfile> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${serverUrl}/api/user/profile`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("Profile load failed");
  return res.json();
}
