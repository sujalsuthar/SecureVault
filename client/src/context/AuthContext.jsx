import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../api/authApi";
import { clearVaultSession } from "../constants/vaultSession";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      return null;
    }
    try {
      const data = await getCurrentUser();
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      clearVaultSession();
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setAuthLoading(true);
    try {
      return await registerUser(payload);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearVaultSession();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, authLoading, login, register, logout, refreshUser }),
    [token, user, authLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
