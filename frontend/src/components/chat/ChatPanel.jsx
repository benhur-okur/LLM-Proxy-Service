import { useState } from "react";
import ActiveModelTabs from "./ActiveModelTabs";
import ModelSelector from "./ModelSelector";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import axios from "../../axios";

export default function ChatPanel() {
  const [activeModels, setActiveModels] = useState([]);
  const [messages, setMessages] = useState([]);

  function handleAddModel(modelName) {
    if (!activeModels.includes(modelName)) {
      setActiveModels((prev) => [...prev, modelName]);
    }
  }

  // Kullanıcının mesajını gönderip backend'ten modellerden yanıtları al
  async function handleSendPrompt(prompt) {
    if (!activeModels.length) {
      alert("Lütfen önce en az bir model ekleyin!");
      return;
    }
  
    // Kullanıcı mesajını hemen ekle
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
  
    try {
      const response = await axios.post("/ask/chat", {
        prompt,
        models: activeModels,
      });
  
      const responses = response.data.responses; // { modelName: responseObjOrString, ... }
  
      const modelMessages = Object.entries(responses).map(([modelName, resp]) => {
        let text = "";
  
        if (typeof resp === "string") {
          text = resp;
        } else if (resp && typeof resp === "object" && "response" in resp) {
          text = resp.response;
        } else {
          text = JSON.stringify(resp);
        }
  
        return {
          id: `${modelName}-${Date.now()}`,
          sender: "model",
          modelName,
          text,
          timestamp: Date.now(),
        };
      });
  
      setMessages((prev) => [...prev, ...modelMessages]);
    } catch (error) {
      console.error("Mesaj gönderilirken hata oluştu:", error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: "system",
        text: "Sunucu hatası: Cevap alınamadı.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }
  
  

  return (
    <div className="flex flex-col h-full w-full">
      <div className="border-b border-gray-300 p-2">
        <ActiveModelTabs activeModels={activeModels} setActiveModels={setActiveModels} />
      </div>

      <div className="border-b border-gray-300 p-2">
        <ModelSelector activeModels={activeModels} onAddModel={handleAddModel} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800">
        <ChatMessageList messages={messages} />
      </div>

      <div className="border-t border-gray-300 p-4 bg-white dark:bg-gray-900">
        <ChatInput onSend={handleSendPrompt} />
      </div>
    </div>
  );
}
