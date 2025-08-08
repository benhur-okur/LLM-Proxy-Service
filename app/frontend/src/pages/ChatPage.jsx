// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatPanel from "../components/chat/ChatPanel";
import { useModelStreams } from "../hooks/useModelStreams";
import { useApiKeys } from "../contexts/ApiKeyContext";
import { useConversations } from "../contexts/ConversationsContext";
import api from "../axios";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [streamingMessages, setStreamingMessages] = useState({});
  const [activeModels, setActiveModels] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const prevConversationId = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { startStreaming } = useModelStreams({ setMessages, setStreamingMessages });
  const { getApiKeyForModel } = useApiKeys?.() || {};
  const { createConversation, upsertConversation, refreshConversations } = useConversations();

  /* ------------ URL → conversationId ------------ */
  useEffect(() => {
    const idParam = new URLSearchParams(location.search).get("conversation_id");
    setConversationId(idParam ? Number(idParam) : null);
  }, [location.search]);

  /* ------------ conversation değişimi ------------ */
  useEffect(() => {
    const prevId = prevConversationId.current;
    const nextId = conversationId;

    /* başka kayda geçerken ekranı temizle */
    if (prevId !== null && prevId !== nextId) {
      setMessages([]);
      setStreamingMessages({});
      setActiveModels([]);
    }
    prevConversationId.current = nextId;

    if (nextId === null) return;              // taslak mod

    /* DB’den mesaj + model çek */
    (async () => {
      try {
        const { data: conv } = await api.get(`/conversations/${nextId}`, { withCredentials: true });

        const dbMsgs = (conv.messages || []).map((m) => ({
          id:        m.id,
          sender:    m.role,
          text:      m.content,
          timestamp: m.created_at,
          modelName: m.modelName,
        }));

        /* ⚠️  yalnızca EKLE / güncelle — mevcut baloncukları silme */
        setMessages((prev) => {
          const map = new Map(prev.map((msg) => [msg.id, msg]));
          dbMsgs.forEach((msg) => map.set(msg.id, msg));
          return Array.from(map.values());
        });

        setActiveModels((prev) => (prev.length ? prev : conv.selected_models || []));
      } catch (err) {
        console.error("Mesajlar alınamadı:", err);
      }
    })();
  }, [conversationId]);

  /* ------------ modelleri debounce ile kaydet ------------ */
  useEffect(() => {
    if (!conversationId) return;
    const t = setTimeout(async () => {
      try {
        await api.put(
          `/conversations/${conversationId}/models`,
          { models: activeModels },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Modeller kaydedilemedi:", err);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [activeModels, conversationId]);

  /* ------------ model chip ekleme ------------ */
  const handleAddModel = (model) =>
    setActiveModels((prev) => (prev.includes(model) ? prev : [...prev, model]));

  /* ------------ prompt gönder ------------ */
  const handleSendPrompt = async (prompt) => {
    if (!activeModels.length) {
      alert("Lütfen önce en az bir model ekleyin!");
      return;
    }

    let convId = conversationId;
    if (!convId) {
      const newConv = await createConversation(prompt.slice(0, 30) || "Yeni Sohbet");
      convId = newConv.id;
      upsertConversation(newConv);
      refreshConversations();
      navigate(`/dashboard/chat?conversation_id=${newConv.id}`, { replace: true });
    }

    /* kullanıcı baloncuğu — EKRANDA KALACAK */
    const promptId = `prompt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${promptId}`,
        sender: "user",
        text: prompt,
        timestamp: new Date().toISOString(),
        promptId,
      },
    ]);
    setStreamingMessages({});

    /* api key’leri */
    const apiKeys = {};
    activeModels.forEach((m) => {
      const k = getApiKeyForModel?.(m);
      if (k) apiKeys[m] = k;
    });

    /* stream başlat */
    try {
      await startStreaming({
        prompt,
        models: activeModels,
        userApiKeys: apiKeys,
        promptId,
        conversationId: convId,
      });
    } catch (err) {
      console.error("Streaming hatası:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${promptId}`,
          sender: "system",
          text: "Sunucu hatası: Cevap alınamadı.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  /* ------------ render ------------ */
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