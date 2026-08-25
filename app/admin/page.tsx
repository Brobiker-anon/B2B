"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Play, Pause, Trash2, Download, Search, 
  Terminal, Globe, MapPin, X, HelpCircle, FileText, Lock, ShieldAlert,
  Fingerprint, RefreshCw, Eye, EyeOff, Users, KeyRound, Copy, Check
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  avatar: string;
  action: string;
  category: "trade" | "wallet" | "security" | "system" | "staking" | "mining" | "real-estate" | "referrals" | "chat";
  status: "success" | "warning" | "failed";
  severity: "info" | "warning" | "error" | "critical";
  ipAddress: string;
  location: string;
  browser: string;
  details?: Record<string, any>;
}

export default function AdminLogsPortal() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  
  // Support Chat States
  const [adminTab, setAdminTab] = useState<"logs" | "support">("logs");
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [activeAdminChatId, setActiveAdminChatId] = useState<string | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState("");
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordShaken, setPasswordShaken] = useState(false);

  // Credentials panel state
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentialsList, setCredentialsList] = useState<any[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const switchAuthMode = (mode: "login" | "register") => {
    setAuthMode(mode);
    setLoginError("");
    setUsernameInput("");
    setEmailInput("");
    setPasswordInput("");
    setConfirmPasswordInput("");
  };

  // Search & Filter States
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // 1. Initial mounting & Session verification check
  useEffect(() => {
    setMounted(true);

    const checkActiveSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.status === 200) {
          const data = await res.json();
          if (data.user?.role === "Administrator") {
            setIsAuthenticated(true);
            setActiveUser(data.user);
            fetchLogsHistory(); // Pre-populate initial logs
          } else {
            setIsAuthenticated(false);
            setLoginError("Forbidden. Administrator access level required.");
          }
        }
      } catch (err) {
        console.error("Session fetch failed on mount:", err);
      }
    };

    checkActiveSession();
  }, []);

  // Poll support chats for live admin desk in real-time
  const fetchSupportChats = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        if (data.chats) {
          setSupportChats(data.chats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch support chats:", err);
    }
  };

  useEffect(() => {
    if (!mounted || !isAuthenticated || adminTab !== "support") return;
    fetchSupportChats();
    const interval = setInterval(fetchSupportChats, 1500); // 1.5s live polling
    return () => clearInterval(interval);
  }, [mounted, isAuthenticated, adminTab]);

  useEffect(() => {
    if (activeAdminChatId) {
      adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeAdminChatId, supportChats]);

  const handleAdminSendMessage = async () => {
    if (!activeAdminChatId || !adminReplyInput.trim()) return;
    const textToSend = adminReplyInput;
    setAdminReplyInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeAdminChatId,
          text: textToSend,
          senderType: "admin"
        })
      });
      if (res.ok) {
        fetchSupportChats();
      }
    } catch (err) {
      console.error("Failed to send admin support reply:", err);
    }
  };

  // 2. Fetch logs history on active authentication
  const fetchLogsHistory = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.status === 200) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to read server logs history:", err);
    }
  };

  // Fetch all registered admin credentials
  const fetchCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setCredentialsList(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    } finally {
      setLoadingCredentials(false);
    }
  };

  const togglePasswordReveal = (username: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {}
  };

  const handleToggleCredentials = () => {
    const next = !showCredentials;
    setShowCredentials(next);
    if (next && credentialsList.length === 0) fetchCredentials();
  };

  // 3. Connect to real-time Server-Sent Events (SSE) Stream
  useEffect(() => {
    if (!mounted || !isAuthenticated || !isLive) return;

    // Open connection to server stream
    const eventSource = new EventSource("/api/logs/stream");

    eventSource.addEventListener("new-log", (event: any) => {
      try {
        const newLog = JSON.parse(event.data);
        setLogs((prev) => {
          // Guard against duplicates
          if (prev.some((log) => log.id === newLog.id)) return prev;
          return [newLog, ...prev];
        });
      } catch (e) {
        console.error("Error parsing stream event data:", e);
      }
    });

    eventSource.addEventListener("clear-logs", () => {
      setLogs([]);
      setSelectedLog(null);
    });

    eventSource.onerror = () => {
      // Re-establish connection automatically on network glitches
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [mounted, isAuthenticated, isLive]);


  // 5. Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();

      if (res.status === 200) {
        if (data.user?.role === "Administrator") {
          setIsAuthenticated(true);
          setActiveUser(data.user);
          setIsSubmitting(false);
          fetchLogsHistory();
        } else {
          setIsSubmitting(false);
          setLoginError("Access Denied. Only administrators can access this terminal.");
          await fetch("/api/auth/logout", { method: "POST" });
        }
      } else {
        setIsSubmitting(false);
        setLoginError(data.error || "Invalid username or password.");
        setPasswordShaken(true);
        setTimeout(() => setPasswordShaken(false), 500);
      }
    } catch (err) {
      setIsSubmitting(false);
      setLoginError("Network error. Please try again.");
    }
  };

  // 5b. Account Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (passwordInput !== confirmPasswordInput) {
      setLoginError("Passwords do not match.");
      setPasswordShaken(true);
      setTimeout(() => setPasswordShaken(false), 500);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, email: emailInput, password: passwordInput, role: "Administrator" })
      });

      const data = await res.json();

      if (res.status === 200) {
        if (data.user?.role === "Administrator") {
          setIsAuthenticated(true);
          setActiveUser(data.user);
          setIsSubmitting(false);
          fetchLogsHistory();
        } else {
          setIsSubmitting(false);
          setLoginError("Access Denied. Registration successful, but admin rights are required.");
          await fetch("/api/auth/logout", { method: "POST" });
        }
      } else {
        setIsSubmitting(false);
        setLoginError(data.error || "Registration failed. Please try again.");
        setPasswordShaken(true);
        setTimeout(() => setPasswordShaken(false), 500);
      }
    } catch (err) {
      setIsSubmitting(false);
      setLoginError("Network error. Please try again.");
    }
  };

  // 6. Lock Terminal / De-authorize
  const handleLockTerminal = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.status === 200) {
        setIsAuthenticated(false);
        setActiveUser(null);
        setUsernameInput("");
        setEmailInput("");
        setPasswordInput("");
        setConfirmPasswordInput("");
        setLogs([]);
        setSelectedLog(null);
      }
    } catch (e) {
      console.error("Lock connection reset:", e);
    }
  };

  // 7. Clear database logs
  const handleClearLogs = async () => {
    if (confirm("Are you sure you want to purge the central server logs database?")) {
      try {
        const res = await fetch("/api/logs", { method: "DELETE" });
        if (res.status === 200) {
          setLogs([]);
          setSelectedLog(null);
        }
      } catch (err) {
        console.error("Purge command execution failure:", err);
      }
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Timestamp,User,Email,Role,Action,Category,Status,Severity,IP Address,Location,Browser\n";
    
    logs.forEach((log) => {
      const row = [
        log.id,
        log.timestamp,
        `"${log.userName}"`,
        `"${log.userEmail}"`,
        `"${log.userRole}"`,
        `"${log.action.replace(/"/g, '""')}"`,
        log.category,
        log.status,
        log.severity,
        log.ipAddress,
        `"${log.location}"`,
        `"${log.browser.replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `server_activity_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Log filter matching
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch = 
        log.action.toLowerCase().includes(searchText.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        log.ipAddress.includes(searchText) ||
        log.location.toLowerCase().includes(searchText.toLowerCase());

      const matchCategory = selectedCategory === "all" || log.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || log.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [logs, searchText, selectedCategory, selectedStatus]);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
        Initializing Security Node...
      </div>
    );
  }

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, x: passwordShaken ? [0, -10, 10, -10, 10, 0] : 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <GlassCard className="border border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] p-8 flex flex-col items-center">

            {/* Header */}
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center border border-brand/30">
                {authMode === "login"
                  ? <Lock className="w-7 h-7 text-brand" />
                  : <ShieldCheck className="w-7 h-7 text-brand" />
                }
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white text-center mb-1">
              {authMode === "login" ? "Admin Portal" : "Create Account"}
            </h2>
            <p className="text-xs text-muted-foreground text-center mb-5 max-w-xs leading-relaxed">
              {authMode === "login"
                ? "Sign in to access the system activity log console."
                : "Register a new administrator account to get started."}
            </p>

            {/* Tab switcher */}
            <div className="flex w-full bg-black/40 rounded-lg p-1 mb-5 border border-white/5">
              <button
                type="button"
                onClick={() => switchAuthMode("login")}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  authMode === "login"
                    ? "bg-brand text-white shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchAuthMode("register")}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  authMode === "register"
                    ? "bg-brand text-white shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error alert */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-2 text-xs text-red-400"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {authMode === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="w-full space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Username
                    </label>
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your username..."
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /><span>Signing in...</span></>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /><span>Sign In</span></>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-muted-foreground pt-1">
                    No account?{" "}
                    <button type="button" onClick={() => switchAuthMode("register")} className="text-brand hover:underline font-semibold">
                      Create one
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegisterSubmit}
                  className="w-full space-y-3.5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Username
                    </label>
                    <div className="relative">
                      <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Choose a username..."
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Min. 6 characters"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-1"
                  >
                    {isSubmitting ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /><span>Creating account...</span></>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /><span>Create Account</span></>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-muted-foreground pt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={() => switchAuthMode("login")} className="text-brand hover:underline font-semibold">
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Authorized Admin Portal Layout
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-brand" /> System Activity Log Console
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time streaming backend logs database. Active Admin session: <span className="text-brand font-semibold">{activeUser?.role}</span>
          </p>
        </div>
        
        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5 bg-black/40 p-1.5 rounded-lg border border-white/5 backdrop-blur-md">
          {/* Pause / Resume Ticker */}
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-md font-medium text-xs flex items-center gap-1.5 transition-all ${
              isLive 
                ? "bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 box-glow" 
                : "bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/5"
            }`}
          >
            {isLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping"></span>
                <span>Streaming Live</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button 
            onClick={handleExportCSV}
            title="Export spreadsheet to CSV sheet"
            className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-md border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button 
            onClick={handleClearLogs}
            title="Purge activity database"
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md border border-red-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Credentials panel toggle */}
          <button
            onClick={handleToggleCredentials}
            title="View registered admin credentials"
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 border ${
              showCredentials
                ? "bg-amber-500/25 border-amber-500/35 text-amber-400"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Credentials
          </button>

          {/* Lock terminal logout */}
          <button 
            onClick={handleLockTerminal}
            title="Lock Console / Sign out session"
            className="px-2.5 py-1.5 bg-red-500/25 hover:bg-red-500/35 border border-red-500/35 rounded-md text-red-500 text-xs font-bold transition-all flex items-center gap-1 box-glow"
          >
            <Lock className="w-3.5 h-3.5 text-red-500" /> Lock Terminal
          </button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 max-w-xs mb-2">
        <button
          onClick={() => setAdminTab("logs")}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
            adminTab === "logs" ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-white"
          }`}
        >
          Console Logs
        </button>
        <button
          onClick={() => setAdminTab("support")}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === "support" ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-white"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Live Support
        </button>
      </div>

      {/* CREDENTIALS PANEL */}
      {showCredentials && (
        <GlassCard className="p-5 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Registered Admin Credentials</h2>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-semibold">
                {credentialsList.length} account{credentialsList.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={fetchCredentials}
              disabled={loadingCredentials}
              className="text-[10px] text-muted-foreground hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loadingCredentials ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {loadingCredentials ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading credentials...
            </div>
          ) : credentialsList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No admin accounts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {credentialsList.map((user: any) => {
                const isRevealed = revealedPasswords.has(user.username);
                const copyUserId = `u-${user.username}`;
                const copyPassId = `p-${user.username}`;
                const copyEmailId = `e-${user.username}`;
                return (
                  <div
                    key={user.username}
                    className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 hover:border-amber-500/30 transition-colors"
                  >
                    {/* Avatar + role */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/40 to-orange-500/40 border border-amber-500/30 flex items-center justify-center text-amber-300 font-extrabold text-sm shrink-0">
                        {user.avatar || user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{user.username}</div>
                        <div className="text-[10px] text-amber-400 font-medium">{user.role}</div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Email</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-300 truncate flex-1 font-mono">{user.email}</span>
                        <button
                          onClick={() => copyToClipboard(user.email, copyEmailId)}
                          className="shrink-0 text-muted-foreground hover:text-white transition-colors p-0.5"
                          title="Copy email"
                        >
                          {copiedField === copyEmailId
                            ? <Check className="w-3 h-3 text-green-400" />
                            : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Password</div>
                      <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs font-mono text-white flex-1 tracking-widest">
                          {isRevealed ? user.password : "•".repeat(Math.min(user.password?.length ?? 8, 12))}
                        </span>
                        <button
                          onClick={() => togglePasswordReveal(user.username)}
                          className="shrink-0 text-muted-foreground hover:text-amber-300 transition-colors p-0.5"
                          title={isRevealed ? "Hide password" : "Reveal password"}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(user.password, copyPassId)}
                          className="shrink-0 text-muted-foreground hover:text-white transition-colors p-0.5"
                          title="Copy password"
                        >
                          {copiedField === copyPassId
                            ? <Check className="w-3 h-3 text-green-400" />
                            : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Joined date */}
                    {user.createdAt && (
                      <div className="text-[9px] text-muted-foreground font-mono pt-1 border-t border-white/5">
                        Registered: {new Date(user.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      )}

      {/* LOGS TAB VIEW */}
      {adminTab === "logs" && (
        <>
          <GlassCard className="p-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter by action keyword, user profile, IP address, or location..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all text-white placeholder-muted-foreground"
            />
            {searchText && (
              <button 
                onClick={() => setSearchText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground focus:outline-none focus:border-brand w-full sm:w-auto cursor-pointer"
            >
              <option value="all">📁 All Folders</option>
              <option value="trade">Trades</option>
              <option value="wallet">Wallet Ops</option>
              <option value="security">Security</option>
              <option value="system">System Logs</option>
              <option value="staking">Staking Pools</option>
              <option value="mining">Mining Power</option>
              <option value="referrals">Referrals</option>
              <option value="chat">Chat Lounge</option>
            </select>

            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground focus:outline-none focus:border-brand w-full sm:w-auto cursor-pointer"
            >
              <option value="all">⚡ All Statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warnings</option>
              <option value="failed">Failed Actions</option>
            </select>

            {(searchText || selectedCategory !== "all" || selectedStatus !== "all") && (
              <button 
                onClick={() => {
                  setSearchText("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="text-[10px] text-brand hover:text-brand-glow font-bold underline cursor-pointer px-1 shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* CORE SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">
        
        {/* logs list */}
        <GlassCard className="lg:col-span-7 p-0 overflow-hidden">
          <div className="max-h-[550px] overflow-y-auto custom-scrollbar">
            {filteredLogs.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider sticky top-0 z-10">
                    <th className="px-4 py-2.5 font-medium">User Profile</th>
                    <th className="px-4 py-2.5 font-medium">Activity Details</th>
                    <th className="px-4 py-2.5 font-medium">Category</th>
                    <th className="px-4 py-2.5 font-medium">Outcome</th>
                    <th className="px-4 py-2.5 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  <AnimatePresence initial={false}>
                    {filteredLogs.map((log) => {
                      const isSelected = selectedLog?.id === log.id;
                      
                      const catColors: Record<string, string> = {
                        trade: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                        wallet: "bg-green-500/10 text-green-400 border border-green-500/20",
                        security: "bg-red-500/10 text-red-400 border border-red-500/20",
                        system: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                        staking: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
                        mining: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
                        "real-estate": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                        referrals: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
                        chat: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      };

                      const statusColors: Record<string, string> = {
                        success: "text-green-400 bg-green-500/5 border border-green-500/10",
                        warning: "text-yellow-400 bg-yellow-500/5 border border-yellow-500/10",
                        failed: "text-red-400 bg-red-500/5 border border-red-500/10"
                      };

                      const logDate = new Date(log.timestamp);
                      const timeStr = `${logDate.getHours().toString().padStart(2, '0')}:${logDate.getMinutes().toString().padStart(2, '0')}:${logDate.getSeconds().toString().padStart(2, '0')}`;

                      return (
                        <motion.tr 
                          key={log.id} 
                          layoutId={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => setSelectedLog(isSelected ? null : log)}
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-brand/10 border-l-4 border-brand text-white" 
                              : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-brand flex items-center justify-center text-white font-bold text-[10px]">
                                {log.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-semibold text-white truncate max-w-[100px]">{log.userName}</div>                                <div className="text-[9px] text-muted-foreground">{log.userRole}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-medium text-white line-clamp-1 max-w-[220px] lg:max-w-[280px]">
                              {log.action}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${catColors[log.category] || "bg-white/5 text-muted-foreground"}`}>
                              {log.category}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${statusColors[log.status] || "bg-white/5"}`}>
                              {log.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span className="text-[9px] font-mono text-muted-foreground">{timeStr}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <HelpCircle className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" />
                <div className="text-sm font-semibold">No activity logs found</div>
                <p className="text-xs mt-1">Try relaxing your search terms or filters.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* forensic inspector panel */}
        <div className="lg:col-span-3">
          {selectedLog ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-6"
            >
              <GlassCard className="border-brand/20 p-4 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl -translate-y-6 translate-x-6 opacity-30 ${
                  selectedLog.status === 'failed' ? 'bg-red-500' : 'bg-brand'
                }`}></div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Log Forensics</h3>
                      <div className="text-[8px] font-mono text-muted-foreground">UUID: {selectedLog.id}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="p-1 hover:bg-white/5 rounded-full text-muted-foreground hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs relative z-10">
                  
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                    <div className="text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">User Identity</div>
                    <div className="font-semibold text-white truncate">{selectedLog.userName} ({selectedLog.userEmail})</div>                    <div className="text-[10px] text-muted-foreground">System Role: <span className="text-brand font-medium">{selectedLog.userRole}</span></div>
                  </div>

                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                    <div className="text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">Action narrative</div>
                    <div className="text-[11px] font-medium text-white leading-relaxed">{selectedLog.action}</div>
                  </div>

                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-2">
                    <div className="text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">Network & Source</div>
                    
                    <div className="grid grid-cols-2 gap-y-1.5 font-mono text-[9px]">
                      <div>
                        <span className="text-muted-foreground block text-[7px] uppercase">IP ADDRESS</span>
                        <span className="text-white font-bold">{selectedLog.ipAddress}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[7px] uppercase">GEO LOCATION</span>
                        <span className="text-white font-bold flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-brand" /> {selectedLog.location}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-white/5 text-[9px] font-mono leading-relaxed text-muted-foreground">
                      <span className="block text-[7px] uppercase font-bold tracking-wider mb-0.5">Device Browser Agent</span>
                      <div className="bg-black/60 p-1.5 rounded border border-white/5 break-all text-white">
                        {selectedLog.browser}
                      </div>
                    </div>
                  </div>

                  {selectedLog.details && (
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-[8px] uppercase tracking-wider font-semibold">Activity Parameters (Payload)</div>
                      <pre className="text-[9px] font-mono bg-black/75 p-2 rounded-lg border border-white/10 overflow-x-auto text-brand-glow max-h-[120px] custom-scrollbar">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="text-[8px] font-mono text-muted-foreground text-center pt-2 border-t border-white/5">
                    GMT TIMESTAMP: {new Date(selectedLog.timestamp).toUTCString()}
                  </div>

                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="p-6 text-center text-muted-foreground border-dashed border-white/10 bg-transparent flex flex-col justify-center items-center h-[280px]">
              <HelpCircle className="w-8 h-8 text-muted-foreground/20 mb-2" />
              <h3 className="text-xs font-semibold text-white">Inspect Details</h3>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[170px] leading-relaxed">
                Click any activity row in the live feed to audit user geographics, browser agents, network parameters, and payload parameters.
              </p>
            </GlassCard>
          )}
        </div>

      </div>
      </>
      )}

      {/* SUPPORT TAB VIEW */}
      {adminTab === "support" && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch h-[580px]">
          {/* User List */}
          <GlassCard className="lg:col-span-3 p-0 flex flex-col overflow-hidden bg-black/45 border border-white/5">
            <div className="p-3 border-b border-white/5 font-bold text-xs uppercase tracking-wider text-muted-foreground bg-black/25">
              Active Support Chats
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {supportChats.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No active support chats yet
                </div>
              ) : (
                supportChats.map((chat) => {
                  const isActive = activeAdminChatId === chat.id;
                  const lastMessage = chat.messages[chat.messages.length - 1];
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveAdminChatId(chat.id)}
                      className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${
                        isActive ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${chat.color || 'from-gray-600 to-gray-400'} flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
                          {chat.avatar}
                        </div>
                        {chat.status === "Online" && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0c0f16]"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="text-white font-bold truncate text-xs">{chat.name}</h3>
                          <span className="text-[9px] text-muted-foreground font-mono">{lastMessage ? lastMessage.time : ""}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{lastMessage ? lastMessage.text : "No messages"}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Active Chat Message Thread */}
          <GlassCard className="lg:col-span-7 p-0 flex flex-col justify-between bg-black/45 border border-white/5">
            {activeAdminChatId ? (
              (() => {
                const activeChat = supportChats.find(c => c.id === activeAdminChatId);
                if (!activeChat) return <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">Select a chat to begin support.</div>;
                return (
                  <>
                    {/* Header */}
                    <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-black/20">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${activeChat.color || 'from-gray-600 to-gray-400'} flex items-center justify-center text-white font-bold text-xs`}>
                        {activeChat.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">{activeChat.name}</div>
                        <div className="text-[9px] text-green-500">Active Session ({activeChat.status})</div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
                      {activeChat.messages.map((msg: any) => {
                        const isMe = msg.senderType === "admin";
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-end gap-1.5 max-w-[80%]">
                              {!isMe && (
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${activeChat.color} flex items-center justify-center text-white text-[9px] font-bold shrink-0 mb-0.5`}>
                                  {activeChat.avatar}
                                </div>
                              )}
                              <div className={`p-3 rounded-xl text-xs ${
                                isMe 
                                  ? 'bg-brand text-white rounded-br-sm shadow-sm' 
                                  : 'bg-black/35 text-white rounded-bl-sm border border-white/5'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                            <span className="text-[8px] text-muted-foreground mt-0.5 mx-8 font-mono">{msg.time}</span>
                          </div>
                        );
                      })}
                      <div ref={adminChatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a support reply..."
                        value={adminReplyInput}
                        onChange={(e) => setAdminReplyInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdminSendMessage()}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
                      />
                      <button
                        onClick={handleAdminSendMessage}
                        className="px-4 py-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs py-12">
                <HelpCircle className="w-8 h-8 text-muted-foreground/20 mb-2" />
                Select a user chat from the list to begin live support.
              </div>
            )}
          </GlassCard>
        </div>
      )}

    </div>
  );
}
