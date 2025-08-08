// src/components/chat/ChatPanel.jsx
import React from "react";
import ActiveModelTabs from "./ActiveModelTabs";
import ModelSelector from "./ModelSelector";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

export default function ChatPanel({
  activeModels,
  setActiveModels,
  messages,
  streamingMessages,
  onAddModel,
  onSendPrompt,
}) {
  const handleRemoveModel = (modelName) => {
    setActiveModels((prev) => prev.filter((m) => m !== modelName));
  };

  return (
    <div className="flex flex-col h-full w-full gap-3">
      {/* Model Chip'leri */}
      <div className="px-3 pt-3">
        <div className="flex flex-wrap gap-2">
          {activeModels.length === 0 && (
            <span className="text-gray-500 text-sm">Henüz model seçilmedi</span>
          )}
          {activeModels.map((model) => (
            <span
              key={model}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-300/50 bg-indigo-50/60 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-sm shadow-[0_0_0_1px_rgba(99,102,241,.15)]"
            >
              {model}
              <button
                onClick={() => handleRemoveModel(model)}
                className="ml-1 rounded-full hover:bg-indigo-100/70 dark:hover:bg-white/10 px-1 font-bold transition"
                aria-label={`Remove model ${model}`}
                title="Kaldır"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Model seçici (komut paleti/detaylar mevcut bileşen içinde) */}
      <div className="px-3">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-2">
          <ModelSelector activeModels={activeModels} onAddModel={onAddModel} />
        </div>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 px-3">
        <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-3 overflow-hidden">
          <ChatMessageList messages={messages} streamingMessages={streamingMessages} />
        </div>
      </div>

      {/* Giriş alanı */}
      <div className="px-3 pb-3">
        <ChatInput onSend={onSendPrompt} />
      </div>
    </div>
  );
}