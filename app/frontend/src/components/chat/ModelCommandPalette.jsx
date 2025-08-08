// src/components/chat/ModelCommandPalette.jsx
import { useEffect, useMemo, useState } from "react";

export default function ModelCommandPalette({ open, onClose, models = [], onSelect }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return models;
    return models.filter((m) => m.name.toLowerCase().includes(q));
  }, [models, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2 border-b border-gray-200/70 dark:border-gray-800/70">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Model ara…"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-sm text-gray-500">Sonuç bulunamadı.</li>
          )}
          {filtered.map((m) => (
            <li key={m.name}>
              <button
                onClick={() => {
                  onSelect?.(m.name);
                  onClose?.();
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{m.name}</div>
                  {m.provider && (
                    <div className="text-xs text-gray-500">{m.provider}</div>
                  )}
                </div>
                <span className="text-xs text-gray-400">Enter</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="px-4 py-3 border-t border-gray-200/70 dark:border-gray-800/70 text-xs text-gray-500 flex items-center gap-2">
          <kbd className="rounded border px-1.5 py-0.5">⌘</kbd>
          <span>+</span>
          <kbd className="rounded border px-1.5 py-0.5">K</kbd>
          <span className="ml-2">ile aç/kapat</span>
        </div>
      </div>
    </div>
  );
}