// src/components/chat/ChatInput.jsx
import React, { useState } from "react";

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    onSend?.(text);
    setValue("");
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-2 shadow-[0_10px_30px_-15px_rgba(0,0,0,.25)]">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Mesajınızı yazın… (Enter ile gönder, Shift+Enter yeni satır)"
          className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[54px] max-h-40 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          onClick={submit}
          className="h-[65px] px-5 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-medium shadow-lg hover:shadow-xl active:scale-[0.98] transition"
        >
          Gönder
        </button>
      </div>
    </div>
  );
}