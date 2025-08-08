// src/components/chat/ModelSelector.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import useModels from "../../hooks/useModels";

const Kbd = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[10px] font-semibold">
    {children}
  </kbd>
);

export default function ModelSelector({ activeModels = [], onAddModel }) {
  const { models, loading } = useModels();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  // ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      const mac = navigator.platform.toUpperCase().includes("MAC");
      const isK = e.key?.toLowerCase() === "k";
      if ((mac && e.metaKey && isK) || (!mac && e.ctrlKey && isK)) {
        e.preventDefault();
        setOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Modal açıkken sayfa scroll’unu kilitle
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const list = Array.isArray(models) ? models : [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((m) => {
      const name = (m?.name ?? "").toLowerCase();
      const type = (m?.type ?? "").toLowerCase();
      return name.includes(term) || type.includes(term);
    });
  }, [models, q]);

  const handlePick = (name) => {
    if (!name || activeModels.includes(name)) return;
    onAddModel?.(name);
    setOpen(false);
    setQ("");
  };

  // Modal içerik (portal ile body’ye basacağız)
  const modal = open ? (
    <div
      className="fixed inset-0 z-[140]"              // ← yüksek z-index
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm z-[141]" />

      {/* Panel */}
      <div className="absolute inset-0 z-[142] grid place-items-start sm:place-items-center pt-14 sm:pt-0">
        <div className="w-[min(92vw,900px)] rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#0f1115]/95 shadow-2xl backdrop-blur-md p-4 sm:p-6">
          {/* Arama */}
          <div className="flex items-center gap-3 mb-4">
            <div className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">🔎</div>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Model ara (örn. gpt, claude, gemini, grok…)"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Kapat (ESC)"
            >
              ESC
            </button>
          </div>

          {/* Liste */}
          <div className="min-h-[260px]">
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Modeller yükleniyor…</div>
            ) : filtered.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((m) => {
                  const name = m?.name || "";
                  const type = m?.type || "";
                  const selected = activeModels.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => !selected && handlePick(name)}
                      disabled={selected}
                      className={[
                        "group text-left rounded-xl border p-4 transition",
                        "bg-white/80 dark:bg-white/5",
                        "border-gray-200 dark:border-white/10",
                        "hover:shadow-md hover:-translate-y-[1px]",
                        selected
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                          {type || "model"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {name} modelini konuşmaya eklemek için tıklayın.
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Sonuç bulunamadı.</div>
            )}
          </div>

          {/* İpucu */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Kbd>{navigator.platform.toUpperCase().includes("MAC") ? "⌘" : "Ctrl"}</Kbd>
              <span>+</span>
              <Kbd>K</Kbd>
              <span>paneli aç/kapat</span>
            </div>
            <div>Seçili modeller listede “disabled” görünür.</div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Tetikleyici */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            inline-flex items-center gap-2 px-3 py-2 rounded-xl
            border border-gray-300 dark:border-white/10
            bg-white/80 dark:bg-white/5
            hover:bg-gray-50 dark:hover:bg-white/10
            text-gray-800 dark:text-gray-100
            shadow-sm
          "
        >
          <span className="text-lg leading-none">＋</span>
          <span className="text-sm font-medium">Model Ekle</span>
          <span className="ml-2 hidden sm:inline-flex items-center gap-1">
            <Kbd>{navigator.platform.toUpperCase().includes("MAC") ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      {/* Modal’ı body’ye bas */}
      {createPortal(modal, document.body)}
    </>
  );
}