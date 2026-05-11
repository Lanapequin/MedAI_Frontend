// Auth utilities — token storage, login/logout, current user

const TOKEN_KEY = 'medai_token';
const USER_KEY  = 'medai_user';

export interface AuthUser {
  username: string;
  email: string;
  full_name: string | null;
  role: string;
}

// ── Storage ──────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── API calls ────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function login(username: string, password: string): Promise<AuthUser> {
  const body = new URLSearchParams({ username, password });
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Usuario o contraseña incorrectos');
  }
  const { access_token } = await res.json();
  setToken(access_token);

  // Fetch user info with the new token
  const me = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const user: AuthUser = await me.json();
  setUser(user);
  return user;
}

export function logout(): void {
  clearAuth();
  window.location.href = '/login';
}

// Attach Bearer token to fetch requests
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
