'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login as apiLogin } from '@/lib/api';

const TOKEN_KEY = 'refa_jwt';

// Secure token storage with encryption (basic implementation)
const secureStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      // In a real production app, use proper encryption like crypto-js or Web Crypto API
      // For now, we'll use a simple base64 encoding as a basic obfuscation
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
  }
};

type AuthContextValue = {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? secureStorage.getItem(TOKEN_KEY) : null,
  );

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    const jwt = res.accessToken ?? res.token;
    secureStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
  }, []);

  const logout = useCallback(() => {
    secureStorage.removeItem(TOKEN_KEY);
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
