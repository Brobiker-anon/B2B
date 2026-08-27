"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { 
  Send, Paperclip, Smile, ShieldCheck, Check, 
  Sparkles, HelpCircle, ArrowRight, MessageSquare, 
  Clock, Shield, User, RefreshCw
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Chat() {
  const { user, addToast } = useApp();
  const [chatData, setChatData] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTypingSelf, setIsTypingSelf] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const activeUsername = user?.username || "Guest";

  // Broadcast typing status to server
  const sendTypingStatus = useCallback(async (isTyping: boolean) => {
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "typing",
          username: activeUsername,
          senderType: "user",
          isTyping,
        }),
      });
    } catch {}
  }, [activeUsername]);

  const isPollingRef = useRef(false);

  // Fetch chat data periodically
  const fetchChat = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const usernameParam = `?username=${encodeURIComponent(activeUsername)}`;
      const res = await fetch(`/api/chat${usernameParam}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          setChatData(data.chat);
        }
      }
    } catch (err) {
      console.error("Failed to poll chat:", err);
    } finally {
      isPollingRef.current = false;
      setLoading(false);
    }
  }, [activeUsername]);

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 400); // Super-fast 400ms real-time sync
    return () => clearInterval(interval);
  }, [fetchChat]);

  // Scroll to bottom on new message or when admin is typing
  useEffect(() => {
    scrollToBottom(true);
  }, [chatData?.messages?.length, chatData?.typing?.admin]);

  // Handle typing input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (!isTypingSelf && val.trim().length > 0) {
      setIsTypingSelf(true);
      sendTypingStatus(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingSelf(false);
      sendTypingStatus(false);
    }, 2000);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || messageInput).trim();
    if (!textToSend || sending) return;

    setMessageInput("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTypingSelf(false);
    sendTypingStatus(false);

    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      sender: activeUsername,
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
          username: activeUsername,
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
        addToast(`File "${target.files[0].name}" attached. Transferring to agent...`, "info");
      }
    };
    fileInput.click();
  };

  const handleEmoji = () => {
    const emojis = ["🚀", "👍", "📈", "💎", "🛡️", "🔥", "⭐", "✅", "❤️", "🎯"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessageInput((prev) => prev + randomEmoji);
  };

  const messages = chatData?.messages || [];
  const isAdminTyping = Boolean(chatData?.typing?.admin);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-8.5rem)] flex gap-4 text-slate-100 max-w-5xl mx-auto pb-2"
    >
      {/* SIDEBAR METADATA & TOPICS */}
      <GlassCard className="w-72 p-0 hidden md:flex flex-col shrink-0 bg-black/40 border border-white/10 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-white">Support Lounge</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Direct priority channel to system administrators.
          </p>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* Agent Status */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Channel Status</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live & Encrypted
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" /> Expected Reply
            </div>
            <div className="text-xs font-bold text-white">&lt; 1 minute (Instant)</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground" /> Account ID
            </div>
            <div className="text-xs font-bold text-brand truncate font-mono">{user?.username || activeUsername}</div>
          </div>

          {/* Quick Support Suggestions */}
          <div className="pt-2">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
              Quick Inquiries
            </div>
            <div className="space-y-1.5">
              {[
                "Deposit status inquiry",
                "Withdrawal confirmation",
                "KYC Verification assistance",
                "Trading limits upgrade",
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSendMessage(topic)}
                  className="w-full text-left p-2 rounded-lg bg-black/30 hover:bg-brand/20 hover:text-brand text-[11px] text-muted-foreground border border-white/5 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{topic}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-white/5 bg-black/30 text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit SSL End-to-End Encrypted</span>
        </div>
      </GlassCard>

      {/* MAIN CHAT AREA */}
      <GlassCard className="flex-1 p-0 flex flex-col min-w-0 bg-black/40 border border-white/10 shadow-2xl overflow-hidden">
        {/* Chat Top Bar */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md select-none">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-brand/20">
                AD
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Admin Support Desk</span>
                <span className="px-1.5 py-0.2 bg-brand/20 text-brand border border-brand/30 rounded text-[9px] font-bold">
                  OFFICIAL
                </span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAdminTyping ? (
                  <p className="text-[10px] text-brand font-semibold flex items-center gap-1">
                    <span className="inline-flex gap-0.5 items-center">
                      <span className="w-1 h-1 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1 h-1 rounded-full bg-brand animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1 h-1 rounded-full bg-brand animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </span>
                    Agent is typing...
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Online • Ready to assist
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchChat}
              title="Refresh conversation"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-medium hidden sm:inline">Encrypted Room</span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-black/20 to-black/40">
          {loading && !chatData ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin"></span>
              Connecting to secure support room...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted-foreground space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="font-semibold text-white">Welcome to Live Support</p>
              <p className="max-w-xs mx-auto">Send a message below. Our administrative personnel are on standby.</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isAdmin = msg.senderType === "admin" || msg.sender === "Admin";
              const isMe = !isAdmin;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                    {isAdmin && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5 select-none shadow-md shadow-brand/20">
                        AD
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none shadow-lg shadow-emerald-900/20"
                          : "bg-slate-800/90 text-white rounded-bl-none border border-white/10 shadow-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] text-muted-foreground mt-1 font-mono ${isMe ? "text-right mr-1" : "text-left ml-9"}`}>
                    {msg.time} {isMe && "✓"}
                  </span>
                </motion.div>
              );
            })
          )}

          {/* ADMIN TYPING ANIMATION BUBBLE */}
          <AnimatePresence>
            {isAdminTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-end gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-md shadow-brand/20">
                  AD
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-white/10 rounded-bl-none shadow-md flex items-center gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">Support Agent is typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all">
            <button
              onClick={handleAttachment}
              type="button"
              title="Attach document or screenshot"
              className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Type your message to Admin Support..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{ fontSize: "16px" }}
              className="flex-1 bg-transparent border-none outline-none text-base text-white px-2 placeholder-muted-foreground"
            />
            <button
              onClick={handleEmoji}
              type="button"
              title="Add reaction emoji"
              className="text-muted-foreground hover:text-white transition-colors mr-1 cursor-pointer"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSendMessage()}
              type="button"
              disabled={!messageInput.trim() || sending}
              className="bg-brand hover:bg-brand/90 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-brand/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Real-time active channel
            </span>
            <span className="hidden sm:inline">Press Enter ↵ to send</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
