import { useState } from "react";

export default function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(customMessage) {
    const userMessage = customMessage || input;

    if (!userMessage.trim()) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: updatedMessages,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ AI error" },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-110 transition-all text-white px-4 py-3 rounded-full shadow-xl animate-pulse"
        >
          💡
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-slate-900 text-white rounded-xl shadow-xl flex flex-col z-50">
          
          <div className="p-3 border-b border-slate-700 font-semibold">
            Fundora AI
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-cyan-600 ml-auto"
                    : "bg-purple-700"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="text-xs text-gray-400">
                AI typing...
              </div>
            )}
          </div>

          {/* 🔥 NEW BUTTON */}
          <div className="px-2 pb-2">
            <button
              onClick={() => sendMessage("Recommend best projects to support")}
              className="w-full text-sm bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 transition-all px-3 py-2 rounded-lg shadow-md"
            >
              🔥 Recommend Projects
            </button>
          </div>
<button
  onClick={() => sendMessage("Show trending projects")}
  className="w-full text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition-all px-3 py-2 rounded-lg shadow-md mt-2"
>
  📈 Trending Now
</button>
          <div className="p-2 border-t border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI..."
              className="flex-1 bg-slate-800 px-2 py-1 rounded"
            />
            <button
              onClick={() => sendMessage()}
              className="bg-purple-600 px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}