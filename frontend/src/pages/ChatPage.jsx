// src/pages/ChatPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatPanel from "../components/chat/ChatPanel";
import { useModelStreams } from "../hooks/useModelStreams";
import { useApiKeys } from "../contexts/ApiKeyContext";
import { useConversations } from "../hooks/useConversations";
import axios from "../axios";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [streamingMessages, setStreamingMessages] = useState({});
  const [activeModels, setActiveModels] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  const { startStreaming } = useModelStreams({ setMessages, setStreamingMessages });
  const { getApiKeyForModel } = useApiKeys?.() || {};
  const { createConversation } = useConversations(); // ✅ Context'ten al

  // URL'den conversationId al
  useEffect(() => {
    const convIdFromUrl = query.get("conversation_id");
    if (convIdFromUrl && convIdFromUrl !== conversationId?.toString()) {
      setConversationId(Number(convIdFromUrl));
    }
  }, [location.search]);

  // conversationId değişince mesajları yükle
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setActiveModels([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/conversations/${conversationId}`, { withCredentials: true });
        const conv = res.data;
        console.log("🧠 Loaded messages from backend:", conv.messages); // modelName başarılı ve doğru şekidle ulaşıyor backend tarafından - sıknıtı yok
        const msgs = (conv.messages || []).map((msg) => ({
          id: msg.id,
          sender: msg.role,
          text: msg.content,
          timestamp: msg.created_at,
          modelName: msg.modelName, 
        }));

        setMessages(msgs);
        setActiveModels(conv.selected_models || []);
      } catch (err) {
        setMessages([]);
        setActiveModels([]);
        console.error("Mesajlar alınamadı:", err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return; // Only save if conversation exists
  
    const debounceTimer = setTimeout(() => {
      const saveModels = async () => {
        try {
          await axios.put(
            `/conversations/${conversationId}/models`,
            { models: activeModels },
            { withCredentials: true }
          );
          console.log("✅ Models saved:", activeModels);
        } catch (err) {
          console.error("❌ Modeller kaydedilemedi:", err);
        }
      };
  
      saveModels();
    }, 500); // Wait 500ms after last change
  
    return () => clearTimeout(debounceTimer); // Reset timer if activeModels changes again quickly
  }, [activeModels, conversationId]);

  // ✅ Yeni sohbet oluştur: context ile global listeye eklenir, sidebar anında güncellenir
  const createNewConversation = async (title) => {
    try {
      const newConv = await createConversation(title || "Yeni Sohbet");
      setConversationId(Number(newConv.id));
      navigate(`/dashboard/chat?conversation_id=${newConv.id}`, { replace: true });
    } catch (err) {
      console.error("Yeni sohbet oluşturulamadı:", err);
    }
  };

  const handleAddModel = (modelName) => {
    if (!activeModels.includes(modelName)) {
      setActiveModels((prev) => [...prev, modelName]); // This will trigger auto-save above which setModels
    }
  };

  const handleSendPrompt = async (prompt) => {
    if (!activeModels.length) {
      alert("Lütfen önce en az bir model ekleyin!");
      return;
    }

    const promptId = `prompt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let currentConversationId = conversationId;

    // Eğer mevcut sohbet yoksa, yeni oluştur
    if (!currentConversationId) {
      const newConv = await createConversation(prompt.slice(0, 30) || "Yeni Sohbet");
      currentConversationId = newConv.id;
      setConversationId(newConv.id);
      navigate(`/dashboard/chat?conversation_id=${newConv.id}`, { replace: true });
    }

    // Kullanıcı mesajını state'e ekle
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: new Date().toISOString(),
      promptId,
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreamingMessages({});

    // Model bazında API key'leri hazırla
    const apiKeys = {};
    activeModels.forEach((model) => {
      const key = getApiKeyForModel?.(model);
      if (key) apiKeys[model] = key;
    });

    // Streaming başlat
    try {
      await startStreaming({
        prompt,
        models: activeModels,
        userApiKeys: apiKeys,
        promptId,
        conversationId: currentConversationId,
      });
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: "system",
        text: "Sunucu hatası: Cevap alınamadı.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <ChatPanel
        activeModels={activeModels}
        setActiveModels={setActiveModels}
        messages={messages}
        streamingMessages={streamingMessages}
        onAddModel={handleAddModel}
        onSendPrompt={handleSendPrompt}
      />
    </div>
  );
}
