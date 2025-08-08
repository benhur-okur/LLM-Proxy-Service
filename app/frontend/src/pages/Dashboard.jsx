// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900">
        <p className="text-lg animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900">
        <p className="text-lg animate-pulse">Veri yükleniyor...</p>
      </div>
    );
  }

  return (
    <Layout>
      {location.pathname === "/dashboard" ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-10 py-12 w-full max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
            Hoşgeldin, <span className="text-accent">{user.username}</span>!
          </h1>
          <p className="text-muted mb-6 text-md flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14v7m0 0H8m4 0h4"
              />
            </svg>
            {user.email}
          </p>

          <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
            Bu panelden <strong>API anahtarlarını yönetebilir</strong>,
            <br />
            <strong>modellerle sohbet edebilir</strong> ve
            <br />
            <strong>hesap ayarlarını düzenleyebilirsin</strong>.
          </p>
        </div>
      ) : (
        <Outlet />
      )}
    </Layout>
  );
}
