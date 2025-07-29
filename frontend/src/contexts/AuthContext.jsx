import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; // burda bir hata olabilri buna dikkat et !
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = kontrol ediliyor

  const checkAuth = async () => {
    console.log("checkAuth çağrıldı");
    try {
      const res = await axios.get("http://localhost:5000/auth/me", {
        withCredentials: true,
      });
      console.log("checkAuth response:", res.data);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("checkAuth error:", error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };
  

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      await checkAuth();
      return { success: true };
    } else {
      return { success: false, message: data.error || "Giriş başarısız" };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Kayıt başarısız" };
      }
    } catch (err) {
      console.error("Register error:", err);
      return { success: false, message: "Sunucu hatası" };
    }
  };

  const logout = async () => {
    await fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
