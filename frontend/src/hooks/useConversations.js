// frontend/src/hooks/useConversations.js
import { useState, useEffect } from "react";
import axios from "../axios";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      console.log("[useConversations] Fetching conversations...");
      const res = await axios.get("/conversations", { withCredentials: true });
      console.log("[useConversations] Conversations fetched:", res.data);
      setConversations(res.data);
    } catch (err) {
      console.error("[useConversations] Sohbetleri alma hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title = "Yeni Sohbet") => {
    try {
      console.log("[useConversations] Creating conversation:", title);
      const res = await axios.post(
        "/conversations",
        { title },
        { withCredentials: true }
      );
      console.log("[useConversations] Conversation created:", res.data);

      // ✅ Yeni sohbeti state'e en üste ekle
      setConversations((prev) => [res.data, ...prev]);

      return res.data;
    } catch (err) {
      console.error("[useConversations] Yeni sohbet oluşturma hatası:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return { conversations, loading, fetchConversations, createConversation };
}
