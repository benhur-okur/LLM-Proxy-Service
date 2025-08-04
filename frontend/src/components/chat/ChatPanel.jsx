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
  // modellerden biri taglerden kaldırılısa bunu useEffect(chatpage ksıımındaki) kullanarak save'le zaten o kısım backend'de db updatelerini halledicek
  const handleRemoveModel = (modelName) => {
    setActiveModels((prev) => prev.filter((m) => m !== modelName));
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Model Tag Container */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap gap-2">
        {activeModels.length === 0 && (
          <span className="text-gray-500 text-sm">Henüz model seçilmedi</span>
        )}
        {activeModels.map((model) => (
          <span
            key={model}
            className="inline-flex items-center bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
          >
            {model}
            <button
              onClick={() => handleRemoveModel(model)}
              className="ml-2 text-white hover:text-gray-200 font-bold"
              aria-label={`Remove model ${model}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <div className="border-b border-gray-300 p-2">
        <ModelSelector activeModels={activeModels} onAddModel={onAddModel} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800">
        <ChatMessageList messages={messages} streamingMessages={streamingMessages} />
      </div>

      <div className="border-t border-gray-300 p-4 bg-white dark:bg-gray-900">
        <ChatInput onSend={onSendPrompt} />
      </div>
    </div>
  );
}
