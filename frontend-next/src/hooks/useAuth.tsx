'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login as apiLogin } from '@/lib/api';

const TOKEN_KEY = 'refa_jwt';

type AuthContextValue = {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  );

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    const jwt = res.accessToken ?? res.token;
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, login, logout, isAuthenticated: Boolean(token) }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
