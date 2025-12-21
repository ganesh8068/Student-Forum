import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_SERVERURL || "http://localhost:5000";

function DiscussionRoom() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! 👋 I'm your AI assistant. Ask me anything about studies, coding, exams, or projects!",
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

      const answer =
        res.data?.answer || "Sorry, I couldn't generate an answer right now.";

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: answer,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
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
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#ECF6F5" }}
    >
      {/* Top bar */}
      <header
        className="px-6 py-4 border-b backdrop-blur-md flex items-center justify-between shadow-sm"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--accent)" }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--color-secondary)" }}
        >
          Discussion Room
        </h1>

        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          Ask your doubts & get instant AI help 🤖
        </p>
      </header>

      {/* Chat body */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        <div
          className="flex-1 overflow-y-auto rounded-2xl shadow p-4 space-y-3"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                  m.sender === "user"
                    ? "rounded-br-sm text-white"
                    : "rounded-bl-sm"
                }`}
                style={{
                  backgroundColor:
                    m.sender === "user" ? "var(--color-primary)" : "#e8f4f2",
                  color:
                    m.sender === "user"
                      ? "white"
                      : "var(--text-dark)",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div
              className="text-xs mt-1"
              style={{ color: "var(--text-soft)" }}
            >
              AI is thinking...
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="mt-4">
          <textarea
            rows={2}
            className="w-full px-3 py-2 rounded-xl border shadow-sm focus:outline-none"
            style={{
              borderColor: "var(--accent)",
              backgroundColor: "var(--card)",
              color: "var(--text-dark)",
              boxShadow: "0 0 0 0 rgba(0,0,0,0)",
            }}
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="mt-2 flex justify-between items-center">
            {err && (
              <span className="text-sm text-red-500">* {err}</span>
            )}

            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-5 py-2 rounded-xl font-medium transition shadow-md disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
              }}
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
