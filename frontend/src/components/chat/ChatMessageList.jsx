// src/components/chat/ChatMessageList.jsx
import React, { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

export default function ChatMessageList({ messages }) {
  const containerRef = useRef(null);

  // Yeni mesaj geldikçe otomatik scroll altta olsun
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Henüz mesaj yok, başlayın!
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 p-2"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
