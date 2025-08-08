// src/contexts/ConversationsContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../axios";

const ConversationsContext = createContext(null);

export function ConversationsProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshConversations = useCallback(async () => {
    try {
      // axios instance baseURL: '/api'
      const res = await api.get("/conversations");
      setConversations(res.data || []);
    } catch (err) {
      console.error("[Conversations] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Eski çağrılarla uyum için alias
  const fetchConversations = refreshConversations;

  const upsertConversation = useCallback((conv) => {
    if (!conv) return;
    setConversations((prev) => {
      const without = prev.filter((c) => String(c.id) !== String(conv.id));
      return [conv, ...without]; // en üste koy
    });
  }, []);

  const removeConversationLocally = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => String(c.id) !== String(id)));
  }, []);

  const deleteConversation = useCallback(
    async (id) => {
      try {
        await api.delete(`/conversations/${id}`);
        removeConversationLocally(id);
        return true;
      } catch (err) {
        console.error("[Conversations] delete error:", err);
        return false;
      }
    },
    [removeConversationLocally]
  );

  const createConversation = useCallback(
    async (title = "Yeni Sohbet") => {
      try {
        const res = await api.post("/conversations", { title });
        const conv = res.data;
        upsertConversation(conv); // anında listeye ekle
        return conv;
      } catch (err) {
        console.error("[Conversations] create error:", err);
        throw err;
      }
    },
    [upsertConversation]
  );

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const value = {
    conversations,
    loading,
    refreshConversations,
    fetchConversations,        // alias
    createConversation,
    upsertConversation,
    removeConversationLocally, // yeni
    deleteConversation,        // yeni
    setConversations,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error("useConversations must be used within ConversationsProvider");
  }
  return ctx;
}