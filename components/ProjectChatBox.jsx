import { useEffect, useState } from "react";

export default function ProjectChatBox({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Load chat history from localStorage (per project)
  useEffect(() => {
    if (!projectId || typeof window === "undefined") return;
    const saved = JSON.parse(
      localStorage.getItem(`chat_${projectId}`) || "[]"
    );
    setMessages(saved);
  }, [projectId]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (!projectId || typeof window === "undefined") return;
    localStorage.setItem(`chat_${projectId}`, JSON.stringify(messages));
  }, [messages, projectId]);

  function handleSend(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now(),
      from: "you",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");
  }

  return (
    <section className="mt-10 bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Chat with project creator
          </h2>
          <p className="text-[11px] text-slate-400">
            Use this box to ask questions or share suggestions. (Demo only – no
            real-time backend yet.)
          </p>
        </div>
      </div>

      {/* Messages window */}
      <div className="mb-3 max-h-60 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-[11px] text-slate-500">
            No messages yet. Start the conversation by sending a message.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex justify-end"
          >
            <div className="max-w-[75%] rounded-2xl bg-blue-600 text-white text-xs px-3 py-1.5 shadow">
              <p>{msg.text}</p>
              <p className="mt-1 text-[9px] text-blue-100/80 text-right">
                You
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-full bg-slate-950/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type your message to the creator..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-medium shadow-md hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-blue-500/40 transition-transform transition-colors"
        >
          Send
        </button>
      </form>
    </section>
  );
}
