import React from "react";
import classNames from "classnames";

function colorForModel(name) {
  // Güvenli hale getir (null/undefined ise boş stringe düş)
  const key = (name ?? "").toString().toLowerCase();

  if (key.includes("gpt"))
    return {
      badge: "text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-500/10",
      border: "border-indigo-200/60 dark:border-indigo-900/40",
    };
  if (key.includes("claude"))
    return {
      badge: "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10",
      border: "border-amber-200/60 dark:border-amber-900/40",
    };
  if (key.includes("gemini"))
    return {
      badge: "text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-500/10",
      border: "border-sky-200/60 dark:border-sky-900/40",
    };
  if (key.includes("grok"))
    return {
      badge: "text-fuchsia-700 bg-fuchsia-50 dark:text-fuchsia-300 dark:bg-fuchsia-500/10",
      border: "border-fuchsia-200/60 dark:border-fuchsia-900/40",
    };
  return {
    badge: "text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-white/5",
    border: "border-gray-200/60 dark:border-gray-800/60",
  };
}

export default function ChatBubble({ message }) {
  const isUser = message?.sender === "user";
  const ts = new Date(message?.timestamp || Date.now()).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const isStreaming = !!message?.streaming;

  const { badge, border } = colorForModel(message?.modelName);

  return (
    <div
      role="group"
      aria-label={isUser ? "Kullanıcı mesajı" : `${message?.modelName || "Model"} mesajı`}
      title={ts}
      className={classNames(
        "max-w-2xl px-4 py-3 rounded-2xl transition-colors duration-300 whitespace-pre-wrap break-words text-sm sm:text-base backdrop-blur border shadow-sm",
        isUser
          ? "ml-auto bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-transparent rounded-br-none"
          : classNames("mr-auto bg-white/70 dark:bg-gray-800/70 text-gray-800 dark:text-gray-100 rounded-bl-none", border)
      )}
    >
      {!isUser && (
        <div className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <span className={classNames("inline-flex items-center gap-1 rounded-full px-2 py-0.5 border", badge, border)}>
            {message?.modelName?.trim() ? message.modelName : "Model"}
          </span>
          <span className="text-[10px] text-gray-400">{ts}</span>
        </div>
      )}
      {isUser && <div className="text-[10px] text-white/80 mb-1 text-right">{ts}</div>}

      <div>
        {message?.text}
        {isStreaming && <span className="inline-block ml-1 animate-blink">|</span>}
      </div>
    </div>
  );
}