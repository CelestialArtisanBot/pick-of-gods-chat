import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { ChatMessage, Message } from "../shared";

// WebSocket connection to PartyKit/Cloudflare worker
const socket = new WebSocket(location.origin.replace(/^http/, "ws"));

function ChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem("username") || `user-${Date.now()}`;
  });

  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("username", username);

    socket.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);

      if (msg.type === "all") {
        setMessages(msg.messages);
      } else if (msg.type === "add") {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.type === "update") {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? msg : m))
        );
      } else if (msg.type === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }
    };
  }, [username]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      user: username,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    socket.send(JSON.stringify({ type: "add", ...newMessage }));
    setInput("");
  };

  const deleteMessage = (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      socket.send(JSON.stringify({ type: "delete", id, user: username }));
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat Room</h1>
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.user === username ? "mine" : ""}`}
          >
            <strong>{msg.user}</strong> [{new Date(msg.timestamp).toLocaleTimeString()}]:
            <span>{msg.content}</span>
            {msg.user === username && (
              <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
            )}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<ChatApp />);
}
