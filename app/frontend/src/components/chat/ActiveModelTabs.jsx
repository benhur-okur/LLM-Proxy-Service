// src/components/chat/ActiveModelTabs.jsx
export default function ActiveModelTabs({ activeModels, setActiveModels }) {
    const removeModel = (modelName) => {
      setActiveModels(activeModels.filter((m) => m !== modelName));
    };
  
    return (
      <div className="flex gap-2 overflow-x-auto">
        {activeModels.length === 0 && (
          <p className="text-gray-500">Henüz model seçilmedi.</p>
        )}
  
        {activeModels.map((model) => (
          <div
            key={model}
            className="flex items-center bg-blue-500 text-white rounded-full px-3 py-1 text-sm whitespace-nowrap"
          >
            <span>{model}</span>
            <button
              onClick={() => removeModel(model)}
              className="ml-2 hover:text-gray-300"
              aria-label={`Remove ${model}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  }
  