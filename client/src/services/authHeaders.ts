// Jedno místo, odkud bereme token a skládáme hlavičky.
// Uprav si klíč/localStorage název, pokud používáš jiný.
export function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      null
    );
  } catch {
    return null;
  }
}

export function buildAuthHeaders(): Record<string, string> {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
