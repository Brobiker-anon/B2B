"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Send, Paperclip, Smile, MoreVertical, ShieldCheck, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Chat() {
  const { user, addToast } = useApp();
  const [chatData, setChatData] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Poll chat history from server in real-time
  const fetchChat = async () => {
    try {
      const username = user?.username || "Guest";
      const res = await fetch(`/api/chat?username=${username}`);
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
    fetchChat();
    const interval = setInterval(fetchChat, 1500); // 1.5s WhatsApp-style real-time poll
    return () => clearInterval(interval);
  }, [user]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const textToSend = messageInput;
    setMessageInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          sender: user?.username || "Guest",
          senderType: "user"
        })
      });

      if (res.ok) {
        fetchChat();
      }
    } catch (err) {
      addToast("Failed to send message.", "error");
    }
  };

  const handleAttachment = () => {
    addToast("Attachments require Admin validation status.", "info");
  };

  const handleEmoji = () => {
    const emojis = ["🚀", "👍", "📈", "💎", "🛡️"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessageInput(prev => prev + randomEmoji);
  };

  const messages = chatData?.messages || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)] flex gap-4 text-slate-100 max-w-5xl mx-auto"
    >
      {/* Sidebar - Connection Detail */}
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
        </div>
      </GlassCard>

      {/* Main Chat Area */}
      <GlassCard className="flex-1 p-0 flex flex-col min-w-0 bg-[#0c0f16] border border-white/5">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ef4444] to-[#b91c1c] flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">Admin Support Desk</h2>
              <p className="text-[9px] text-green-500 font-medium">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
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
              const isMe = msg.senderType === "user";
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-end gap-2 max-w-[75%]">
                    {!isMe && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ef4444] to-[#b91c1c] flex items-center justify-center text-white text-[9px] font-bold shrink-0 mb-0.5 select-none">
                        AD
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl text-xs ${
                      isMe 
                        ? 'bg-[#089981] text-white rounded-br-sm shadow-sm' 
                        : 'bg-black/35 text-white rounded-bl-sm border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 mx-8 font-mono">{msg.time}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5 bg-white/5">
          <div className="flex items-center gap-2 bg-black/35 border border-white/10 rounded-full px-4 py-2 focus-within:border-[#089981] transition-colors">
            <button onClick={handleAttachment} className="text-muted-foreground hover:text-white transition-colors cursor-pointer">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Message Admin Support securely..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent border-none outline-none text-xs text-white px-2 placeholder-muted-foreground"
            />
            <button onClick={handleEmoji} className="text-muted-foreground hover:text-white transition-colors mr-1 cursor-pointer">
              <Smile className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSendMessage} 
              className="bg-[#089981] hover:bg-[#089981]/90 text-white p-2 rounded-full transition-colors cursor-pointer"
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
