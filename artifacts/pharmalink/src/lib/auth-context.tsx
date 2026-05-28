import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type AuthUser, getStoredAuth, storeAuth, clearAuth, initAuthTokenGetter } from "./auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(getStoredAuth);
  const queryClient = useQueryClient();

  useEffect(() => {
    initAuthTokenGetter();
  }, []);

  const login = useCallback((token: string, user: AuthUser) => {
    storeAuth(token, user);
    setAuthState({ token, user });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuthState({ token: null, user: null });
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user: authState.user, token: authState.token, isAuthenticated: !!authState.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
