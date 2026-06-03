'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login as apiLogin } from '@/lib/api';

const TOKEN_KEY = 'refa_jwt';

// ── JWT decode (no verification — server already verified it) ─────────────────
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ── Secure token storage with basic obfuscation ───────────────────────────────
const secureStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      const encodedValue = btoa(encodeURIComponent(value));
      localStorage.setItem(key, encodedValue);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const encodedValue = localStorage.getItem(key);
      if (!encodedValue) return null;
      return decodeURIComponent(atob(encodedValue));
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'MECANICO' | 'ASESOR' | 'ALMACEN' | 'CLIENTE';

export type AuthUser = {
  id: number;
  username: string;
  rol: UserRole;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

function parseUser(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const sub = payload.sub as number | undefined;
  const username = payload.username as string | undefined;
  const rol = payload.rol as UserRole | undefined;
  if (!sub || !username || !rol) return null;
  return { id: sub, username, rol };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return secureStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const t = secureStorage.getItem(TOKEN_KEY);
    return t ? parseUser(t) : null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    const jwt = res.accessToken ?? res.token;
    secureStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    setUser(parseUser(jwt));
  }, []);

  const logout = useCallback(() => {
    secureStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: Boolean(token) }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
