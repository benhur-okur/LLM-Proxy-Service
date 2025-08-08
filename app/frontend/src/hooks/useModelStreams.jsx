// src/hooks/useModelStreams.jsx
import { useCallback } from "react";

export function useModelStreams({ setMessages, setStreamingMessages }) {
  /**
   * Modellerden eş-zamanlı stream başlatır.
   * «prev => …» formu sayesinde eski mesaj dizisi ASLA silinmez – 
   * sadece ekleme / güncelleme yapılır.
   */
  const startStreaming = useCallback(
    async ({ prompt, models, promptId, userApiKeys, conversationId }) => {
      const controller = new AbortController();

      console.log("Streaming Request Body:", {
        prompt,
        models,
        user_api_key: userApiKeys,
        conversation_id: Number(conversationId) || null,
      });

      const url = `/api/ask/chat/stream`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        credentials: "include",
        body: JSON.stringify({
          prompt,
          models,
          user_api_key: userApiKeys,
          conversation_id: conversationId ?? null,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Streaming başlatılamadı.");
      }

      const decoder = new TextDecoder();
      const reader = res.body.getReader();
      const modelBuffers = {};

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
            const data = JSON.parse(jsonStr); // { modelName, chunk, done }
            const modelName = data.modelName || data.model;
            const chunkText = data.chunk || "";
            if (!modelName) continue;

            modelBuffers[modelName] = (modelBuffers[modelName] || "") + chunkText;
            const streamId = `streaming-${modelName}-${promptId}`;
            const finalId  = `model-${modelName}-${promptId}`;

            if (data.done) {
              //Mevcut streaming kaydını kaldır + finali ekle
              setMessages(prev => {
                const withoutStream = prev.filter(m => m.id !== streamId);
                return [
                  ...withoutStream,
                  {
                    id: finalId,
                    sender: "model",
                    modelName,
                    text: modelBuffers[modelName],
                    timestamp: new Date().toISOString(),
                    promptId,
                    conversationId,
                  },
                ];
              });
              // streaming list’ten sil
              setStreamingMessages(prev => {
                const next = { ...prev };
                delete next[modelName];
                return next;
              });
            } else {
              // Anlık chunk – always functional update
              setStreamingMessages(prev => ({
                ...prev,
                [modelName]: {
                  id: streamId,
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

      return () => controller.abort(); // İsteği iptal etme imkânı
    },
    [setMessages, setStreamingMessages]
  );

  return { startStreaming };
}