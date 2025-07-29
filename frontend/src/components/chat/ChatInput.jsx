import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      onSend(trimmed);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        className="flex-grow border rounded px-3 py-2 resize-none dark:bg-gray-700 dark:text-white"
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Mesajınızı yazıp Enter ile gönderin..."
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!input.trim()}
      >
        Gönder
      </button>
    </form>
  );
}
