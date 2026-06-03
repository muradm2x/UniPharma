import { setAuthTokenGetter } from "@workspace/api-client-react";

export interface AuthUser {
  id: number;
  email: string;
  role: "candidate" | "employer" | "admin";
  fullName: string;
  phone?: string | null;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const TOKEN_KEY = "unipharma_token";
const USER_KEY = "unipharma_user";

export function getStoredAuth(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function storeAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function initAuthTokenGetter(): void {
  setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));
}
