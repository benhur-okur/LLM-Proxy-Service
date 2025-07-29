// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import ChatPanel from "../components/chat/ChatPanel";


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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 w-full max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold mb-3">
            Hoşgeldin,{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {user.username}
            </span>
            !
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 inline-block text-gray-500 dark:text-gray-400"
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

          <p className="text-gray-700 dark:text-gray-400">
            Bu panelden API anahtarlarını yönetebilir, modellerle sohbet
            edebilir ve hesap ayarlarını düzenleyebilirsin.
          </p>
        </div>
      ) : (
        <Outlet />
      )}
    </Layout>
  );
}
