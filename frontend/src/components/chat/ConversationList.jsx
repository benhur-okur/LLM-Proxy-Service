// src/components/chat/ConversationList.jsx
import { useState, useEffect } from "react";
import axios from "../../axios"; // kendi axios instance'im ile değiştirdim 
import { useConversations } from "../../hooks/useConversations";

export default function ConversationList({ onSelect }) {
  const { conversations, loading, createConversation, fetchConversations } = useConversations();
  const [localConversations, setLocalConversations] = useState([]);

  // conversations context’ten geldiğinde local state’e kopyala
  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  const handleNewChat = async () => {
    const newConv = await createConversation();
    onSelect(newConv.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu sohbeti silmek istediğine emin misin?")) {
      try {
        await axios.delete(`/conversations/${id}`, { withCredentials: true });
        // Listeyi yenile
        fetchConversations();
      } catch (err) {
        alert("Sohbet silinemedi!");
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-4">Yükleniyor...</div>;

  return (
    <div className="p-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
        onClick={handleNewChat}
      >
        ➕ Yeni Sohbet
      </button>

      <ul className="space-y-2">
        {localConversations.map((conv) => (
          <li
            key={conv.id}
            className="flex justify-between items-center cursor-pointer hover:bg-gray-200 p-2 rounded"
          >
            <span onClick={() => onSelect(conv.id)} className="truncate max-w-[200px]">
              {conv.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(conv.id);
              }}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
              title="Sohbeti Sil"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
