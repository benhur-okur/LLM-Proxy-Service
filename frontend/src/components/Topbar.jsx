// src/components/Topbar.jsx
import { useAuth } from "../contexts/AuthContext";
import { MoonIcon, SunIcon } from "@heroicons/react/outline";
import { useTheme } from "../contexts/ThemeContext"; // ThemeContext'ten alıyoruz

export default function Topbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          )}
        </button>
        <span className="text-gray-800 dark:text-white">{user?.username}</span>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
