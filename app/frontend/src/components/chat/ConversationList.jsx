// src/components/chat/ConversationList.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../axios";
import { useConversations } from "../../contexts/ConversationsContext";

export default function ConversationList({ onSelect }) {
  const { conversations, refreshConversations } = useConversations();
  const [localConversations, setLocalConversations] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // URL'deki aktif ID
  const activeId = useMemo(() => {
    const id = new URLSearchParams(location.search).get("conversation_id");
    return id ? Number(id) : null;
  }, [location.search]);

  useEffect(() => {
    setLocalConversations(conversations || []);
  }, [conversations]);

  const handleSelect = (id) => {
    if (onSelect) onSelect(id);
    else navigate(`/dashboard/chat?conversation_id=${id}`);
  };

  const handleNewChat = () => {
    navigate(`/dashboard/chat`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu sohbeti silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/conversations/${id}`, { withCredentials: true });

      // Eğer silinen aktif sohbetse, boş “draft” chat’e dön
      if (activeId === id) {
        navigate(`/dashboard/chat`, { replace: true });
      }

      // Listeyi yenile
      await refreshConversations();
    } catch (err) {
      console.error("Sohbet silinemedi:", err);
      // Basit uyarı—istersen toast’a çevirebilirsin
      alert("Sohbet silinemedi.");
    }
  };

  return (
    <div className="p-3">
      {/* Yeni Sohbet */}
      <button
        onClick={handleNewChat}
        className="
          w-full mb-3 inline-flex items-center justify-center gap-2
          rounded-xl px-3 py-2 text-sm font-medium
          bg-primary/90 hover:bg-primary text-white
          shadow-sm transition
        "
        title="Yeni sohbet başlat (ilk mesajda kaydedilir)"
      >
        <span className="text-lg leading-none">＋</span>
        Yeni Sohbet
      </button>

      {/* Liste */}
      <ul className="space-y-1">
        {localConversations.map((conv) => {
          const isActive = activeId === conv.id;
          return (
            <li key={conv.id}>
              <div
                onClick={() => handleSelect(conv.id)}
                className={[
                  "group flex items-center justify-between gap-2 cursor-pointer rounded-lg px-3 py-2 border transition",
                  "border-transparent hover:bg-gray-50 dark:hover:bg-white/5",
                  isActive
                    ? "bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-300/60 dark:border-indigo-500/30 ring-2 ring-indigo-200 dark:ring-indigo-500/30"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Aktif işaret (sol nokta) */}
                  <span
                    className={[
                      "h-2 w-2 rounded-full flex-shrink-0",
                      isActive ? "bg-indigo-500" : "bg-gray-300 dark:bg-white/20",
                    ].join(" ")}
                  />
                  <span className="truncate text-sm text-gray-900 dark:text-gray-100">
                    {conv.title || "Yeni Sohbet"}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conv.id);
                  }}
                  className="text-red-500/80 hover:text-red-600 dark:hover:text-red-400 text-sm font-bold px-1"
                  title="Sohbeti Sil"
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {!localConversations?.length && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Henüz kayıtlı sohbet yok. “Yeni Sohbet” ile başlayın; ilk mesajdan
          sonra burada görünecek.
        </div>
      )}
    </div>
  );
}