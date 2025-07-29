// src/components/chat/ChatBubble.jsx
import React from "react";
import classNames from "classnames";

/**
 * Tek bir mesaj balonu (kullanıcı veya model) gösterir.
 * @param {Object} message - Mesaj objesi.
 * @param {"user" | "model"} message.sender - Mesajı gönderen taraf.
 * @param {string} [message.modelName] - Modelin adı (sadece model mesajları için).
 * @param {string} message.text - Mesaj içeriği.
 * @param {string} message.timestamp - ISO tarih formatı.
 */
export default function ChatBubble({ message }) {
  const isUser = message.sender === "user";
  const timestamp = new Date(message.timestamp).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      role="group"
      aria-label={
        isUser ? "Kullanıcı mesajı" : `${message.modelName || "Model"} mesajı`
      }
      className={classNames(
        "max-w-2xl px-4 py-3 my-2 rounded-2xl shadow-sm transition-colors duration-300",
        "whitespace-pre-wrap break-words text-sm sm:text-base",
        isUser
          ? "bg-blue-600 text-white self-end rounded-br-none"
          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 self-start rounded-bl-none"
      )}
      title={timestamp}
    >
      {!isUser && (
        <div className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-300">
          {message.modelName || "Model"}
        </div>
      )}
      <div>{message.text}</div>
    </div>
  );
}
