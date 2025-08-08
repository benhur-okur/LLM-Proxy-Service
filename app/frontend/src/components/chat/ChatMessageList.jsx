import React, { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";

export default function ChatMessageList({ messages, streamingMessages }) {
  const containerRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // streamingMessages objesi boşsa boş nesne ata
  streamingMessages = streamingMessages || {};

  // Kullanıcı scroll yaptığında otomatik scroll durumunu ayarla
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // 50 px ile alt sınır belirliyoruz, 50 px den yakınsa aşağıdayız ve otomatik scroll açık
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAutoScroll(atBottom);
  };

  // messages veya streamingMessages değiştiğinde, eğer otomatik scroll aktifse aşağı kaydır
  useEffect(() => {
    if (isAutoScroll && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, streamingMessages, isAutoScroll]);

  // streamingMessages objesinden sadece metinleri alıp arraye çeviriyoruz
  const streamingMsgsArray = Object.values(streamingMessages);

  // Tamamlanan mesajlar + streaming mesajlar birleşik
  const combinedMessages = [...messages, ...streamingMsgsArray];

  if (!combinedMessages.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Henüz mesaj yok, başlayın!
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-col h-full overflow-y-auto space-y-2 p-2"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      tabIndex={0}
    >
      {combinedMessages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
