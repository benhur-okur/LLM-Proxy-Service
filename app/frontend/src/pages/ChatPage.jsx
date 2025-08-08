// src/pages/ChatPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatPanel from "../components/chat/ChatPanel";
import { useModelStreams } from "../hooks/useModelStreams";
import { useApiKeys } from "../contexts/ApiKeyContext";
import { useConversations } from "../contexts/ConversationsContext";
import api from "../axios";

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

  // ⬇️ Artık context’ten:
  const { createConversation, upsertConversation, refreshConversations } = useConversations();

  /**
   * URL'den conversation_id oku.
   * - Varsa: o ID'ye geç.
   * - Yoksa: draft moda geç (conversationId = null) ve eski sohbeti temizleyecek effect tetiklensin.
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const convIdFromUrl = params.get("conversation_id");

    if (convIdFromUrl) {
      const nextId = Number(convIdFromUrl);
      if (conversationId !== nextId) setConversationId(nextId);
    } else {
      if (conversationId !== null) setConversationId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /**
   * Draft moda geçildiğinde arayüzü sıfırla.
   * (Eski sohbeti görmeye devam etme problemi burada çözülür.)
   */
  useEffect(() => {
    if (conversationId === null) {
      setMessages([]);
      setStreamingMessages({});
      setActiveModels([]);
    }
  }, [conversationId]);

  // conversationId değişince mesajları yükle
  useEffect(() => {
    if (!conversationId) {
      // Draft modda zaten temizledik; burada da güvence olsun
      setMessages([]);
      setActiveModels([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res  = await api.get(`/conversations/${conversationId}`, { withCredentials: true });
        const conv = res.data;

        const msgsFromDb = (conv.messages || []).map((msg) => ({
          id: msg.id,
          sender: msg.role,
          text: msg.content,
          timestamp: msg.created_at,
          modelName: msg.modelName,
        }));

        // 🔑 Mevcut state'i koruyarak birleştir
        setMessages((prev) => {
          const byId = new Map(prev.map((m) => [m.id, m]));
          // DB’den gelen her kaydı (ayarlandıysa) override et
          msgsFromDb.forEach((m) => byId.set(m.id, m));
          return Array.from(byId.values());
        });

        // modeller
        setActiveModels((prev) => (prev.length ? prev : (conv.selected_models || [])));
      } catch (err) {
        setMessages([]);
        setActiveModels([]);
        console.error("Mesajlar alınamadı:", err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Modelleri debounce ile kaydet
  useEffect(() => {
    if (!conversationId) return;

    const t = setTimeout(async () => {
      try {
        await api.put(
          `/conversations/${conversationId}/models`,
          { models: activeModels },
          { withCredentials: true }
        );
        console.log("✅ Models saved:", activeModels);
      } catch (err) {
        console.error("❌ Modeller kaydedilemedi:", err);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [activeModels, conversationId]);

  // Manuel “Yeni Sohbet” butonu akışı (gerekirse)
  const createNewConversation = async (title) => {
    try {
      const newConv = await createConversation(title || "Yeni Sohbet");
      // Sidebar anında güncel (provider içindeki upsert + burada da güçlendirme)
      upsertConversation(newConv);
      refreshConversations();

      setConversationId(Number(newConv.id));
      navigate(`/dashboard/chat?conversation_id=${newConv.id}`, { replace: true });
    } catch (err) {
      console.error("Yeni sohbet oluşturulamadı:", err);
    }
  };

  const handleAddModel = (modelName) => {
    if (!activeModels.includes(modelName)) {
      setActiveModels((prev) => [...prev, modelName]);
    }
  };

  const handleSendPrompt = async (prompt) => {
    if (!activeModels.length) {
      alert("Lütfen önce en az bir model ekleyin!");
      return;
    }

    const promptId = `prompt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let currentConversationId = conversationId;

    // Konuşma yoksa: oluştur + modelleri anında yaz + Sidebar’ı tazele
    if (!currentConversationId) {
      const newConv = await createConversation(prompt.slice(0, 30) || "Yeni Sohbet");
      currentConversationId = newConv.id;
      setConversationId(newConv.id);

      // Sidebar anında güncellensin
      upsertConversation(newConv);
      refreshConversations();

      // Seçili modelleri persist
      if (activeModels.length) {
        try {
          await api.put(
            `/conversations/${newConv.id}/models`,
            { models: activeModels },
            { withCredentials: true }
          );
        } catch (e) {
          console.error("İlk yaratımda modeller yazılamadı:", e);
        }
      }

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