// src/components/Layout.jsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div className="relative flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* --- Futuristic arka plan layer'ları --- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Yumuşak gradient bloblar */}
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        {/* İnce grid */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12]">
          <div className="h-full w-full"
               style={{
                 backgroundImage:
                   "linear-gradient(to right, rgba(120,120,120,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,120,.25) 1px, transparent 1px)",
                 backgroundSize: "28px 28px",
               }}
          />
        </div>
      </div>

      {/* --- Sol Sidebar --- */}
      <Sidebar />

      {/* --- İçerik --- */}
      <div className="relative z-[1] flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="relative h-full overflow-auto p-6 sm:p-8">
          {/* Cam efektli kart zemin */}
          <div className="mx-auto w-full max-w-7xl rounded-2xl border border-white/10 bg-white/70 p-4 shadow-lg backdrop-blur-md transition dark:border-gray-800/50 dark:bg-gray-900/60">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}