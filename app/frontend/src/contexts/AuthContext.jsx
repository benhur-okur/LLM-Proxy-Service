// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      setIsAuthenticated(true);
      return true;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      await checkAuth();
    })();
  }, []);

  const login = async (email, password) => {
    try {
      await api.post("/auth/login", { email, password });
      // tam sayfa yenileme: tarayıcı Set-Cookie'yi garantiler
      window.location.href = `${window.location.origin}/dashboard`;
      return { success: true };
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Giriş başarısız";
      return { success: false, message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post("/auth/register", { username, email, password });
      return { success: true, message: res.data.message || "Kayıt başarılı" };
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Kayıt başarısız";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setIsAuthenticated(false);
  };

  const loading = isAuthenticated === null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);