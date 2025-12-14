import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_SERVERURL || "http://localhost:5000";

function DiscussionRoom() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! 👋 I'm your AI assistant. Ask me any question related to studies, coding, exams, or projects.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;
    setErr("");

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/api/ai/chat`,
        { question },
        { withCredentials: true }
      );
      console.log(res);

      const answer =
        res.data?.answer || "Sorry, I couldn't generate an answer.";
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: answer,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error.message);
      setErr(error?.response?.data?.message || "AI request failed.");
      const aiMsg = {
        id: `ai_err_${Date.now()}`,
        sender: "ai",
        text: "Sorry, I had an issue answering your question. Please try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
      {/* Top bar */}
      <header className="px-6 py-4 border-b bg-white/80 backdrop-blur-md flex items-center justify-between">
        <h1 className="text-xl font-bold text-orange-600">Discussion Room</h1>
        <p className="text-sm text-gray-500">
          Ask your doubts & get instant AI help 🤖
        </p>
      </header>

      {/* Chat body */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        <div className="flex-1 overflow-y-auto border rounded-2xl bg-white/80 shadow-sm p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-orange-500 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-gray-500 mt-2">AI is thinking...</div>
          )}
        </div>

        {/* Input box */}
        <div className="mt-4">
          <textarea
            rows={2}
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-red-500">{err && `* ${err}`}</span>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-5 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Ask AI"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DiscussionRoom;
