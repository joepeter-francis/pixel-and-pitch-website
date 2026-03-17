const API_URL = import.meta.env.VITE_API_URL || "https://api-marketplace.pixelndpitch.com";

export function storeAuth(token: string, user: { id: string; email: string }) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getStoredUser(): { id: string; email: string } | null {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}

function getToken() { return localStorage.getItem("access_token"); }

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as Record<string, string>).error || res.statusText || "";
    throw new Error(`HTTP ${res.status}${message ? `: ${message}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
