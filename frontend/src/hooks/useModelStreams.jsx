import { useCallback } from "react";

export function useModelStreams({ setMessages, setStreamingMessages }) {
  const startStreaming = useCallback(
    async ({ prompt, models, promptId, userApiKeys, conversationId }) => {
      const controller = new AbortController();

      console.log("📡 Streaming Request Body:", { // for debugging
        prompt,
        models,
        user_api_key: userApiKeys,
        conversation_id: Number(conversationId) || null,
      });

      const res = await fetch("http://localhost:5000/ask/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          prompt,
          models,
          user_api_key: userApiKeys,
          conversation_id: conversationId ?? null, // null yerine direkt parametre
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Streaming başlatılamadı.");
      }

      const decoder = new TextDecoder();
      const reader = res.body.getReader();

      const modelBuffers = {}; // Model bazında buffer

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (let line of lines) {
          line = line.trim();
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace("data: ", "");
          if (jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr); // { model, chunk, done }
            const modelName = data.modelName || data.model;
            const chunkText = data.chunk || "";

            if (!modelName) continue;

            modelBuffers[modelName] = (modelBuffers[modelName] || "") + chunkText;

            if (data.done) {
              // Streaming bitince tamamlanan mesaj olarak ekle
              setMessages((prev) => [
                ...prev,
                {
                  id: `model-${modelName}-${promptId}`,
                  sender: "model",
                  modelName,
                  text: modelBuffers[modelName],
                  timestamp: new Date().toISOString(),
                  promptId,
                  conversationId,
                },
              ]);
              // Streaming mesajlardan çıkar
              setStreamingMessages((prev) => {
                const copy = { ...prev };
                delete copy[modelName];
                return copy;
              });
            } else {
              // Streaming devam ederken geçici güncelleme
              setStreamingMessages((prev) => ({
                ...prev,
                [modelName]: {
                  id: `streaming-${modelName}-${promptId}`,
                  sender: "model",
                  modelName,
                  text: modelBuffers[modelName],
                  timestamp: new Date().toISOString(),
                  streaming: true,
                  promptId,
                  conversationId,
                },
              }));
            }
          } catch (err) {
            console.error("Streaming JSON parse hatası:", err);
          }
        }
      }
    },
    [setMessages, setStreamingMessages]
  );

  return { startStreaming };
}
