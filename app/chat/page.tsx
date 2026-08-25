"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { Send, Paperclip, Smile, ShieldCheck, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Chat() {
  const { user, addToast } = useApp();
  const [chatData, setChatData] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const fetchChat = async () => {
    if (!user?.username) {
      setLoading(false);
      return;
    }

    try {
      const usernameParam = `?username=${encodeURIComponent(user.username)}`;
      const res = await fetch(`/api/chat${usernameParam}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        setChatData(null);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          setChatData(data.chat);
        }
      }
    } catch (err) {
      console.error("Failed to poll chat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.username) {
      setLoading(false);
      return;
    }

    fetchChat();
    const interval = setInterval(fetchChat, 1500);
    return () => clearInterval(interval);
  }, [user?.username]);

  useEffect(() => {
    scrollToBottom(false);
  }, [chatData?.messages?.length]);

  const handleSendMessage = async () => {
    if (!user?.username) {
      addToast("Please sign in to use live chat.", "error");
      return;
    }

    if (!messageInput.trim() || sending) return;

    const textToSend = messageInput.trim();
    setMessageInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender: user.username,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderType: "user",
    };

    setChatData((prev: any) => ({
      ...prev,
      messages: [...(prev?.messages || []), optimisticMessage],
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          senderType: "user",
          username: user.username,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          setChatData(data.chat);
        } else {
          fetchChat();
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast(errData.error || "Failed to deliver message.", "error");
        fetchChat();
      }
    } catch {
      addToast("Failed to send message.", "error");
      fetchChat();
    } finally {
      setSending(false);
    }
  };

  const handleAttachment = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,.pdf,.doc,.docx,.txt";
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        addToast(`File "${target.files[0].name}" selected. Upload feature coming soon.`, "info");
      }
    };
    fileInput.click();
  };

  const handleEmoji = () => {
    const emojis = ["🚀", "👍", "📈", "💎", "🛡️", "🔥", "⭐", "✅", "❤️", "🎯"];
    setMessageInput((prev) => prev + emojis[Math.floor(Math.random() * emojis.length)]);
  };

  if (!user) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-slate-100">
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="text-lg font-bold text-white mb-2">Sign in required</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Please sign in to connect with admin support.
          </p>
          <Link
            href="/signin"
            className="inline-block px-4 py-2 bg-brand text-white rounded-lg text-sm font-bold"
          >
            Sign In
          </Link>
        </GlassCard>
      </div>
    );
  }

  const messages = chatData?.messages || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)] flex gap-4 text-slate-100 max-w-5xl mx-auto"
    >
      <GlassCard className="w-72 p-0 hidden md:flex flex-col shrink-0 bg-[#0c0f16] border border-white/5">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">Live Chat Support</h2>
          <p className="text-[10px] text-muted-foreground mt-1">Connect instantly with administrative personnel.</p>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Channel</div>
            <div className="text-xs font-bold text-white">System Admin Desk</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average Reply Time</div>
            <div className="text-xs font-bold text-[#089981]">&lt; 1 minute</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Account Mode</div>
            <div className="text-xs font-bold text-brand">{user.username}</div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="flex-1 p-0 flex flex-col min-w-0 bg-[#0c0f16] border border-white/5">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ef4444] to-[#b91c1c] flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">Admin Support Desk</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[9px] text-green-500 font-medium">Online & Ready</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#089981]" />
            <span className="text-[10px] font-medium hidden sm:inline">256-bit Encrypted</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && !chatData ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
              <span className="w-4 h-4 rounded-full border border-[#089981] border-t-transparent animate-spin"></span>
              Connecting to secure room...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No messages yet. Send a message to contact Admin.
            </div>
          ) : (
            messages.map((msg: any) => {
              const isAdmin = msg.senderType === "admin";
              const isMe = !isAdmin && msg.senderType === "user";
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                    {isAdmin && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ef4444] to-[#b91c1c] flex items-center justify-center text-white text-[9px] font-bold shrink-0 mb-0.5 select-none shadow-sm">
                        AD
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? "bg-[#089981] text-white rounded-br-sm shadow-sm"
                          : isAdmin
                            ? "bg-[#3b82f6] text-white rounded-bl-sm shadow-sm"
                            : "bg-black/40 text-white rounded-bl-sm border border-white/10"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  <span className={`text-[9px] text-muted-foreground mt-1 font-mono ${isMe ? "text-right mr-8" : "text-left ml-8"}`}>
                    {msg.time}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/5 bg-white/5">
          <div className="flex items-center gap-2 bg-black/35 border border-white/10 rounded-full px-4 py-2 focus-within:border-[#089981] transition-colors">
            <button onClick={handleAttachment} type="button" className="text-muted-foreground hover:text-white transition-colors cursor-pointer">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Message Admin Support securely..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-xs text-white px-2 placeholder-muted-foreground"
            />
            <button onClick={handleEmoji} type="button" className="text-muted-foreground hover:text-white transition-colors mr-1 cursor-pointer">
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={handleSendMessage}
              type="button"
              disabled={!messageInput.trim() || sending}
              className="bg-[#089981] hover:bg-[#089981]/90 disabled:opacity-50 text-white p-2 rounded-full transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-muted-foreground font-mono">
            <Check className="w-3.5 h-3.5 text-[#089981]" /> End-to-end encrypted connection verified
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
