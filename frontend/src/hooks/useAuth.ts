import { useCallback, useState } from "react";
import { obtenerToken } from "../api/client";

const TOKEN_KEY = "refa_auth_token";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (username: string, password: string) => {
    const { token: nuevoToken } = await obtenerToken(username, password);
    localStorage.setItem(TOKEN_KEY, nuevoToken);
    setToken(nuevoToken);
    return nuevoToken;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return { token, login, logout, isAuthenticated: Boolean(token) };
}
