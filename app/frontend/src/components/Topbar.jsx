// src/components/Topbar.jsx
import { useAuth } from "../contexts/AuthContext";
import { MoonIcon, SunIcon } from "@heroicons/react/outline";
import { useTheme } from "../contexts/ThemeContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-[3] border-b border-white/10 bg-white/70 px-4 py-3 shadow navbar:shadow-none backdrop-blur-md transition dark:border-gray-800/50 dark:bg-gray-900/60 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Sol: Başlık + küçük neon accent */}
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px] shadow-primary/60" />
          <div className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-200">
            Dashboard
          </div>
        </div>

        {/* Sağ: Tema + kullanıcı + çıkış */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-white/50 text-gray-700 shadow transition hover:shadow-card dark:border-gray-800/40 dark:bg-gray-900/50 dark:text-gray-200"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          <div className="hidden items-center gap-3 rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm shadow backdrop-blur-sm dark:border-gray-800/40 dark:bg-gray-900/50 sm:flex">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/70 to-secondary/70" />
            <span className="max-w-[160px] truncate">{user?.username}</span>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-danger px-3 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 active:scale-[0.98]"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </header>
  );
}