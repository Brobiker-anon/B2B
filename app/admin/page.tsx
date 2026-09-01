"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, DollarSign, PlusCircle, MinusCircle, MessageSquare, 
  Search, Copy, Check, Eye, EyeOff, Lock, ShieldCheck, 
  Trash2, Download, RefreshCw, ArrowUpRight, ArrowDownLeft, 
  Landmark, Wallet, KeyRound, Globe, Phone, Mail, 
  CheckCircle2, XCircle, Clock, AlertCircle, Terminal, 
  LogOut, ShieldAlert, Fingerprint, ChevronRight, UserPlus,
  Send, UserCheck, Settings, ExternalLink, HelpCircle,
  Pencil, Plus
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { getPusherClient } from "@/utils/pusherClient";

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  avatar: string;
  action: string;
  category: string;
  status: "success" | "warning" | "failed";
  severity: "info" | "warning" | "error" | "critical";
  ipAddress: string;
  location: string;
  browser: string;
  details?: Record<string, any>;
}

export interface UserAccount {
  username: string;
  password: string;
  email: string;
  role: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  phone?: string;
  currency?: string;
  referralCode?: string;
  createdAt: string;
  realBalance: number;
  usdtBalance: number;
  btcBalance: number;
  demoBalance: number;
  stakedBalance: number;
  miningEarnings: number;
  submissionsCount?: number;
  hasChat?: boolean;
  submissions?: any[];
}

export interface SubmissionItem {
  id: string;
  type: "deposit" | "withdraw" | "withdrawal";
  username: string;
  email: string;
  reference: string;
  method: string;
  amountVal: string;
  amountAsset: string;
  totalUsd: string;
  status: "Pending" | "Approved" | "Cancelled";
  details?: Record<string, any>;
  createdAt: string;
}

export default function AdminPortal() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAdmin, setActiveAdmin] = useState<any>(null);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "accounts" | "balance" | "submissions" | "chats" | "logs">("dashboard");

  // Data States
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [submissionsList, setSubmissionsList] = useState<SubmissionItem[]>([]);
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isLiveStream, setIsLiveStream] = useState(true);

  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Search & Filter States
  const [accountSearch, setAccountSearch] = useState("");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "deposit" | "withdraw" | "Pending" | "Approved" | "Cancelled">("all");
  const [submissionUserFilter, setSubmissionUserFilter] = useState<string>("all");
  const [logSearch, setLogSearch] = useState("");
  const [logCategoryFilter, setLogCategoryFilter] = useState("all");

  // Create Deposit Modal State
  const [isCreateDepositOpen, setIsCreateDepositOpen] = useState(false);
  const [newDepositUser, setNewDepositUser] = useState("");
  const [newDepositType, setNewDepositType] = useState<"deposit" | "withdraw">("deposit");
  const [newDepositMethod, setNewDepositMethod] = useState("Crypto Deposit");
  const [newDepositAmount, setNewDepositAmount] = useState("");
  const [newDepositAsset, setNewDepositAsset] = useState("USDT");
  const [newDepositStatus, setNewDepositStatus] = useState<"Approved" | "Pending" | "Cancelled">("Approved");
  const [newDepositRef, setNewDepositRef] = useState("");
  const [newDepositCreditBalance, setNewDepositCreditBalance] = useState(true);
  const [newDepositNote, setNewDepositNote] = useState("");
  const [isCreatingDeposit, setIsCreatingDeposit] = useState(false);

  // Edit Submission Modal State
  const [isEditDepositOpen, setIsEditDepositOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<SubmissionItem | null>(null);
  const [editAmountVal, setEditAmountVal] = useState("");
  const [editAmountAsset, setEditAmountAsset] = useState("USDT");
  const [editTotalUsd, setEditTotalUsd] = useState("");
  const [editMethod, setEditMethod] = useState("");
  const [editStatus, setEditStatus] = useState<"Approved" | "Pending" | "Cancelled">("Approved");
  const [editReference, setEditReference] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Account Password Visibility & Clipboard
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Selected User Modal / Detail
  const [inspectUser, setInspectUser] = useState<UserAccount | null>(null);
  const [inspectSubmission, setInspectSubmission] = useState<SubmissionItem | null>(null);

  // Create User Modal State
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserUname, setNewUserUname] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserRole, setNewUserRole] = useState<"User" | "Administrator">("User");
  const [newUserCountry, setNewUserCountry] = useState("United States");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserCurrency, setNewUserCurrency] = useState("USD");
  const [newUserRealBal, setNewUserRealBal] = useState("0");
  const [newUserBtcBal, setNewUserBtcBal] = useState("0");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState("");

  // Add/Deduct Balance Form State
  const [balanceUser, setBalanceUser] = useState<string>("");
  const [balanceOperation, setBalanceOperation] = useState<"add" | "deduct" | "set">("add");
  const [balanceAsset, setBalanceAsset] = useState<"realBalance" | "usdtBalance" | "btcBalance" | "demoBalance" | "stakedBalance">("realBalance");
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceNote, setBalanceNote] = useState<string>("");
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);
  const [balanceSuccessMsg, setBalanceSuccessMsg] = useState<string | null>(null);

  // Chat Support States
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatReplyText, setChatReplyText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [isAdminTypingSelf, setIsAdminTypingSelf] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Session Check
  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "Administrator") {
            setIsAuthenticated(true);
            setActiveAdmin(data.user);
            fetchAllAdminData();
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };
    checkSession();
  }, []);

  // 2. Fetch All Data
  const fetchAllAdminData = async () => {
    setLoadingData(true);
    try {
      // Fetch users and submissions
      const usersRes = await fetch("/api/admin/users", { cache: "no-store" });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users || []);
        setSubmissionsList(data.submissions || []);
        if (data.users?.length > 0 && !balanceUser) {
          setBalanceUser(data.users[0].username);
        }
      }

      // Fetch logs
      const logsRes = await fetch("/api/logs");
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setLogs(lData.logs || []);
      }

      // Fetch chats directly from MongoDB
      const chatRes = await fetch("/api/chat?all=true", { cache: "no-store" });
      if (chatRes.ok) {
        const cData = await chatRes.json();
        const incomingChats = cData.chats || [];
        setSupportChats(incomingChats);
        if (incomingChats.length > 0 && !activeChatId) {
          setActiveChatId(incomingChats[0].id);
        }
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Poll chats periodically from MongoDB Atlas
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "chats") return;
    const interval = setInterval(async () => {
      if (isAdminPollingRef.current) return;
      isAdminPollingRef.current = true;
      try {
        const chatRes = await fetch("/api/chat?all=true", { cache: "no-store" });
        if (chatRes.ok) {
          const cData = await chatRes.json();
          const incomingChats = cData.chats || [];
          setSupportChats((prev) => {
            if (!prev.length) return incomingChats;
            return incomingChats.map((nc: any) => {
              const existing = prev.find((p) => p.id === nc.id);
              return {
                ...nc,
                typing: { ...(nc.typing || {}), ...(existing?.typing || {}) },
              };
            });
          });
        }
      } catch {} finally {
        isAdminPollingRef.current = false;
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeChatId) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChatId, supportChats]);

  // Real-time WebSocket connection via Pusher Channels for Admin
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const pusher = getPusherClient();
      console.log("📡 [Admin Pusher] Subscribing to admin channels");
      const channel1 = pusher.subscribe("admin-support-channel");
      const channel2 = pusher.subscribe("global-support-chat");

      const handleNewMessage = (data: any) => {
        console.log("⚡ [Admin WebSocket] Received new-message event:", data);
        if (data?.chatId && data?.message) {
          setSupportChats((prev) => {
            const cleanTarget = (data.chat?.username || data.chatId || "").toLowerCase().replace(/^chat_/, "").replace(/[\s_-]+/g, "");

            const existingIndex = prev.findIndex(
              (c) =>
                c.id === data.chatId ||
                (c.id && c.id.toLowerCase().replace(/^chat_/, "").replace(/[\s_-]+/g, "") === cleanTarget) ||
                (c.username && c.username.toLowerCase().replace(/[\s_-]+/g, "") === cleanTarget)
            );

            if (existingIndex !== -1) {
              const existing = prev[existingIndex];
              const currentMsgs = existing.messages || [];

              const msgMap = new Map();
              currentMsgs.forEach((m: any) => msgMap.set(m.id, m));
              // Remove temporary optimistic message if admin reply
              if (data.message.senderType === "admin") {
                for (const [k, v] of msgMap.entries()) {
                  if (k.startsWith("admin-") && v.text === data.message.text) {
                    msgMap.delete(k);
                  }
                }
              }
              msgMap.set(data.message.id, data.message);

              const updatedChat = {
                ...existing,
                messages: Array.from(msgMap.values()),
                lastUpdated: new Date().toISOString(),
                typing: { ...(existing.typing || {}), user: false },
              };

              const copy = [...prev];
              copy[existingIndex] = updatedChat;
              return copy;
            } else if (data.chat) {
              return [data.chat, ...prev];
            }
            return prev;
          });
        }
      };

      const handleTyping = (data: any) => {
        console.log("⌨️ [Admin WebSocket] User typing event received:", data);
        if (data?.chatId && data?.senderType === "user") {
          const cleanTarget = (data.username || data.chatId || "").toLowerCase().replace(/^chat_/, "").replace(/[\s_-]+/g, "");
          setSupportChats((prev) =>
            prev.map((c) =>
              c.id === data.chatId ||
              (c.id && c.id.toLowerCase().replace(/^chat_/, "").replace(/[\s_-]+/g, "") === cleanTarget) ||
              (c.username && c.username.toLowerCase().replace(/[\s_-]+/g, "") === cleanTarget)
                ? {
                    ...c,
                    typing: {
                      ...(c.typing || {}),
                      user: Boolean(data.isTyping),
                    },
                  }
                : c
            )
          );
        }
      };

      channel1.bind("new-message", handleNewMessage);
      channel2.bind("new-message", handleNewMessage);
      channel1.bind("typing", handleTyping);
      channel2.bind("typing", handleTyping);

      return () => {
        channel1.unbind_all();
        channel2.unbind_all();
        pusher.unsubscribe("admin-support-channel");
        pusher.unsubscribe("global-support-chat");
      };
    } catch (e) {
      console.error("Admin Pusher client error:", e);
    }
  }, [isAuthenticated]);

  // SSE Live Logs
  useEffect(() => {
    if (!mounted || !isAuthenticated || !isLiveStream) return;
    const es = new EventSource("/api/logs/stream");

    es.addEventListener("new-log", (evt: any) => {
      try {
        const newL = JSON.parse(evt.data);
        setLogs((prev) => {
          if (prev.some((x) => x.id === newL.id)) return prev;
          return [newL, ...prev];
        });
      } catch {}
    });

    es.addEventListener("clear-logs", () => {
      setLogs([]);
    });

    return () => es.close();
  }, [mounted, isAuthenticated, isLiveStream]);

  // Auth Submit Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingAuth(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.user?.role === "Administrator") {
        setIsAuthenticated(true);
        setActiveAdmin(data.user);
        fetchAllAdminData();
      } else {
        setLoginError(data.error || "Access Denied. Administrator role required.");
        if (data.user?.role !== "Administrator") {
          await fetch("/api/auth/logout", { method: "POST" });
        }
      }
    } catch {
      setLoginError("Network connection failed.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (passwordInput !== confirmPasswordInput) {
      setLoginError("Passwords do not match.");
      return;
    }
    setIsSubmittingAuth(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          email: emailInput,
          password: passwordInput,
          role: "Administrator",
        }),
      });
      const data = await res.json();
      if (res.ok && data.user?.role === "Administrator") {
        setIsAuthenticated(true);
        setActiveAdmin(data.user);
        fetchAllAdminData();
      } else {
        setLoginError(data.error || "Registration failed.");
      }
    } catch {
      setLoginError("Network connection failed.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setActiveAdmin(null);
      setUsersList([]);
      setSubmissionsList([]);
      setLogs([]);
      setSupportChats([]);
    } catch {}
  };

  // Clipboard copy
  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(id);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {}
  };

  // Toggle single password visibility
  const togglePassword = (uname: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(uname)) next.delete(uname);
      else next.add(uname);
      return next;
    });
  };

  // Balance Adjustment Submit
  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceSuccessMsg(null);
    const num = parseFloat(balanceAmount);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    if (!balanceUser) {
      alert("Please select a user account.");
      return;
    }

    setBalanceSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_balance",
          username: balanceUser,
          operation: balanceOperation,
          asset: balanceAsset,
          amount: num,
          note: balanceNote || "Admin dashboard adjustment",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBalanceSuccessMsg(`Success! ${balanceOperation === "add" ? "Added" : balanceOperation === "deduct" ? "Deducted" : "Set"} ${num.toLocaleString()} ${balanceAsset} for ${balanceUser}.`);
        setBalanceAmount("");
        setBalanceNote("");

        // Also update local storage for this user so active client instances pick it up immediately
        const userObj = usersList.find((u) => u.username.toLowerCase() === balanceUser.toLowerCase());
        if (userObj && typeof window !== "undefined") {
          const storageKey = `brokerage_balances_${balanceUser.toLowerCase()}`;
          const currentReal = userObj.realBalance;
          const newReal = balanceAsset === "realBalance" || balanceAsset === "usdtBalance"
            ? (balanceOperation === "add" ? currentReal + num : balanceOperation === "deduct" ? Math.max(0, currentReal - num) : num)
            : currentReal;
          
          localStorage.setItem(storageKey, JSON.stringify({
            realBalance: newReal,
            usdtBalance: newReal,
            demoBalance: userObj.demoBalance,
            btcBalance: balanceAsset === "btcBalance" 
              ? (balanceOperation === "add" ? userObj.btcBalance + num : balanceOperation === "deduct" ? Math.max(0, userObj.btcBalance - num) : num)
              : userObj.btcBalance,
            stakedBalance: balanceAsset === "stakedBalance"
              ? (balanceOperation === "add" ? userObj.stakedBalance + num : balanceOperation === "deduct" ? Math.max(0, userObj.stakedBalance - num) : num)
              : userObj.stakedBalance,
            miningEarnings: userObj.miningEarnings,
          }));
        }

        // Refresh users and logs
        fetchAllAdminData();
        setTimeout(() => setBalanceSuccessMsg(null), 5000);
      } else {
        alert(data.error || "Failed to adjust balance.");
      }
    } catch {
      alert("Network error updating balance.");
    } finally {
      setBalanceSubmitting(false);
    }
  };

  // Quick Action from Table to open Balance tool with user selected
  const triggerBalanceForUser = (uname: string, op: "add" | "deduct" = "add") => {
    setBalanceUser(uname);
    setBalanceOperation(op);
    setActiveTab("balance");
  };

  // Submission Status update
  const handleUpdateSubmissionStatus = async (id: string, status: "Approved" | "Pending" | "Cancelled") => {
    try {
      const res = await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setSubmissionsList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
        fetchAllAdminData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Create New Account Handler directly from Admin
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError("");

    if (!newUserUname.trim()) {
      setCreateUserError("Username is required.");
      return;
    }
    if (!newUserEmail.trim()) {
      setCreateUserError("Email address is required.");
      return;
    }
    if (!newUserPass || newUserPass.length < 6) {
      setCreateUserError("Password must be at least 6 characters.");
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_user",
          newUsername: newUserUname.trim(),
          newEmail: newUserEmail.trim(),
          newPassword: newUserPass,
          newRole: newUserRole,
          newCountry: newUserCountry,
          newPhone: newUserPhone,
          newCurrency: newUserCurrency,
          newRealBalance: parseFloat(newUserRealBal) || 0,
          newBtcBalance: parseFloat(newUserBtcBal) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateUserOpen(false);
        setNewUserUname("");
        setNewUserEmail("");
        setNewUserPass("");
        setNewUserPhone("");
        setNewUserRealBal("0");
        setNewUserBtcBal("0");
        fetchAllAdminData();
      } else {
        setCreateUserError(data.error || "Failed to create account.");
      }
    } catch {
      setCreateUserError("Network error while creating account.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Create Custom Deposit / Submission for User
  const handleCreateDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepositUser) {
      alert("Please select a user account.");
      return;
    }
    if (!newDepositAmount || parseFloat(newDepositAmount) <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    setIsCreatingDeposit(true);
    try {
      const rawAmt = parseFloat(newDepositAmount) || 0;
      const isBtc = newDepositAsset === "BTC";
      const totalUsdVal = isBtc ? `$${(rawAmt * 63000).toFixed(2)}` : `$${rawAmt.toFixed(2)}`;

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newDepositUser,
          type: newDepositType,
          method: newDepositMethod,
          amountVal: newDepositAmount,
          amountAsset: newDepositAsset,
          totalUsd: totalUsdVal,
          status: newDepositStatus,
          reference: newDepositRef || undefined,
          creditBalance: newDepositCreditBalance && newDepositStatus === "Approved" && newDepositType === "deposit",
          details: {
            adminNote: newDepositNote || "Admin created deposit entry",
            source: "Admin Portal",
            createdAt: new Date().toISOString(),
          },
        }),
      });

      if (res.ok) {
        setIsCreateDepositOpen(false);
        setNewDepositAmount("");
        setNewDepositNote("");
        setNewDepositRef("");
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create deposit.");
      }
    } catch {
      alert("Network error creating deposit.");
    } finally {
      setIsCreatingDeposit(false);
    }
  };

  // Open Edit Modal for a Submission
  const openEditSubmission = (sub: SubmissionItem) => {
    setEditingSubmission(sub);
    setEditAmountVal(sub.amountVal);
    setEditAmountAsset(sub.amountAsset || "USDT");
    setEditTotalUsd(sub.totalUsd);
    setEditMethod(sub.method);
    setEditStatus(sub.status);
    setEditReference(sub.reference);
    setEditNote(sub.details?.adminNote || "");
    setIsEditDepositOpen(true);
  };

  // Save Edited Submission
  const handleSaveEditSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubmission) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSubmission.id,
          amountVal: editAmountVal,
          amountAsset: editAmountAsset,
          totalUsd: editTotalUsd.startsWith("$") ? editTotalUsd : `$${editTotalUsd}`,
          method: editMethod,
          status: editStatus,
          reference: editReference,
          details: {
            ...(editingSubmission.details || {}),
            adminNote: editNote,
          },
        }),
      });

      if (res.ok) {
        setIsEditDepositOpen(false);
        setEditingSubmission(null);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update submission.");
      }
    } catch {
      alert("Network error saving submission.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Submission
  const handleDeleteSubmission = async (id: string, refCode: string) => {
    if (!confirm(`Are you sure you want to permanently delete submission "${refCode}"?`)) return;
    try {
      const res = await fetch(`/api/submissions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubmissionsList((prev) => prev.filter((s) => s.id !== id));
        if (inspectSubmission?.id === id) setInspectSubmission(null);
        if (editingSubmission?.id === id) setIsEditDepositOpen(false);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete submission.");
      }
    } catch {
      alert("Network error deleting submission.");
    }
  };

  // Send Admin Chat Typing Status
  const sendAdminTypingStatus = async (isTyping: boolean) => {
    const targetChatId = activeChatId || currentChat?.id;
    if (!targetChatId) return;
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "typing",
          chatId: targetChatId,
          senderType: "admin",
          isTyping,
        }),
      });
    } catch {}
  };

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChatReplyText(val);

    if (!isAdminTypingSelf && val.trim().length > 0) {
      setIsAdminTypingSelf(true);
      sendAdminTypingStatus(true);
    }

    if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);

    adminTypingTimeoutRef.current = setTimeout(() => {
      setIsAdminTypingSelf(false);
      sendAdminTypingStatus(false);
    }, 2000);
  };

  // Send Admin Chat Reply
  const handleSendChatReply = async (textOverride?: string) => {
    const targetChatId = activeChatId || currentChat?.id;
    if (!targetChatId) return;
    const text = (textOverride || chatReplyText).trim();
    if (!text) return;

    setChatReplyText("");
    if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
    setIsAdminTypingSelf(false);
    sendAdminTypingStatus(false);

    const tempMsg = {
      id: `admin-${Date.now()}`,
      sender: "Admin",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderType: "admin",
    };

    setSupportChats((prev) =>
      prev.map((c) =>
        c.id === targetChatId
          ? { ...c, messages: [...(c.messages || []), tempMsg], lastUpdated: new Date().toISOString() }
          : c
      )
    );

    console.log("💬 [Admin -> Chat] Dispatching reply to:", {
      targetChatId,
      text,
      time: tempMsg.time,
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: targetChatId,
          text,
          senderType: "admin",
          clientTime: tempMsg.time,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log("✅ [Admin -> Chat] Reply delivered successfully:", data);
        if (data?.message) {
          setSupportChats((prev) =>
            prev.map((c) =>
              c.id === targetChatId
                ? {
                    ...c,
                    messages: (() => {
                      const msgMap = new Map();
                      (c.messages || []).forEach((m: any) => msgMap.set(m.id, m));
                      // Replace temp optimistic message
                      for (const [k, v] of msgMap.entries()) {
                        if (k.startsWith("admin-") && v.text === text) {
                          msgMap.delete(k);
                        }
                      }
                      msgMap.set(data.message.id, data.message);
                      return Array.from(msgMap.values());
                    })(),
                    lastUpdated: new Date().toISOString(),
                  }
                : c
            )
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("❌ [Admin -> Chat] Reply failed:", errData);
      }
    } catch (err) {
      console.error("❌ [Admin -> Chat] Send network error:", err);
    } finally {
      setSendingChat(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (uname: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${uname}"?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_user", username: uname }),
      });
      if (res.ok) {
        setUsersList((prev) => prev.filter((u) => u.username.toLowerCase() !== uname.toLowerCase()));
        if (inspectUser?.username.toLowerCase() === uname.toLowerCase()) setInspectUser(null);
      } else {
        const d = await res.json();
        alert(d.error || "Could not delete user.");
      }
    } catch {
      alert("Error deleting user.");
    }
  };

  // Filtered Accounts
  const filteredUsers = useMemo(() => {
    if (!accountSearch.trim()) return usersList;
    const term = accountSearch.toLowerCase();
    return usersList.filter((u) =>
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.country?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      u.referralCode?.toLowerCase().includes(term)
    );
  }, [usersList, accountSearch]);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((s) => {
      const matchesType = 
        submissionFilter === "all" ||
        (submissionFilter === "deposit" && s.type === "deposit") ||
        (submissionFilter === "withdraw" && (s.type === "withdraw" || s.type === "withdrawal")) ||
        s.status === submissionFilter;

      const matchesUser =
        submissionUserFilter === "all" ||
        s.username.toLowerCase() === submissionUserFilter.toLowerCase();

      const term = submissionSearch.toLowerCase();
      const matchesSearch =
        !term ||
        s.username.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.reference.toLowerCase().includes(term) ||
        s.method.toLowerCase().includes(term) ||
        s.totalUsd.toLowerCase().includes(term);

      return matchesType && matchesUser && matchesSearch;
    });
  }, [submissionsList, submissionFilter, submissionUserFilter, submissionSearch]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchCat = logCategoryFilter === "all" || l.category === logCategoryFilter;
      const term = logSearch.toLowerCase();
      const matchSearch =
        !term ||
        l.userName.toLowerCase().includes(term) ||
        l.action.toLowerCase().includes(term) ||
        l.ipAddress.includes(term);
      return matchCat && matchSearch;
    });
  }, [logs, logCategoryFilter, logSearch]);

  // Sorted Support Chats by last activity
  const sortedSupportChats = useMemo(() => {
    return [...supportChats].sort((a, b) => {
      const aTime = new Date(a.lastUpdated || 0).getTime();
      const bTime = new Date(b.lastUpdated || 0).getTime();
      return bTime - aTime;
    });
  }, [supportChats]);

  // Selected Chat Object
  const currentChat = useMemo(() => {
    if (activeChatId) {
      const found = supportChats.find((c) => c.id === activeChatId);
      if (found) return found;
    }
    return sortedSupportChats[0] || supportChats[0] || null;
  }, [supportChats, sortedSupportChats, activeChatId]);

  // Selected User Object for balance calculations
  const selectedBalanceUserObj = useMemo(() => {
    return usersList.find((u) => u.username.toLowerCase() === balanceUser.toLowerCase());
  }, [usersList, balanceUser]);

  // Total Summary Stats
  const totalBalanceAllUsers = useMemo(() => {
    return usersList.reduce((acc, u) => acc + (u.realBalance || 0), 0);
  }, [usersList]);

  const pendingSubmissionsCount = useMemo(() => {
    return submissionsList.filter((s) => s.status === "Pending").length;
  }, [submissionsList]);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-brand" /> Initializing Admin Center...
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATION SCREEN (When not logged in as Administrator)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <GlassCard className="p-8 border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand mb-4 box-glow">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your administrative credentials to access management tools.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-black/40 p-1 rounded-xl mb-5 border border-white/5">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setLoginError(""); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === "login" ? "bg-brand text-white shadow" : "text-muted-foreground hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setLoginError(""); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === "register" ? "bg-brand text-white shadow" : "text-muted-foreground hover:text-white"
                }`}
              >
                Create Admin
              </button>
            </div>

            {loginError && (
              <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Admin Username / Email</label>
                  <div className="relative">
                    <Fingerprint className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Username or email"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isSubmittingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Sign In as Admin</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Admin username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@brokerage.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isSubmittingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Register Administrator</span>
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED MINIMALIST ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 pt-2 px-2 sm:px-4">
      
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-brand" /> Admin Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Control
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Logged in as <span className="text-white font-semibold">{activeAdmin?.username}</span> ({activeAdmin?.role})
          </p>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllAdminData}
            title="Refresh database"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin text-brand" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => triggerBalanceForUser(usersList[0]?.username || "")}
            className="px-3 py-2 rounded-lg bg-brand hover:bg-brand/90 text-white font-medium text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add / Deduct Funds</span>
          </button>

          <button
            onClick={handleLogout}
            title="Lock & Logout"
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1.5 text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
        {[
          { id: "dashboard", label: "Overview", icon: Landmark, count: null },
          { id: "accounts", label: "Accounts", icon: Users, count: usersList.length },
          { id: "balance", label: "Add / Deduct Funds", icon: DollarSign, count: null },
          { id: "submissions", label: "Deposits & Withdrawals", icon: ArrowUpRight, count: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : null, alert: pendingSubmissionsCount > 0 },
          { id: "chats", label: "Support Chats", icon: MessageSquare, count: supportChats.length },
          { id: "logs", label: "Activity Logs", icon: Terminal, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : tab.alert ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/10 text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "dashboard" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-5 border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Accounts</p>
                <p className="text-2xl font-extrabold text-white mt-1">{usersList.length}</p>
                <p className="text-[11px] text-brand mt-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Registered Users
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-brand">
                <Users className="w-6 h-6" />
              </div>
            </GlassCard>

            <GlassCard className="p-5 border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total System Balance</p>
                <p className="text-2xl font-extrabold text-white mt-1">${totalBalanceAllUsers.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Simulated Vault
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet className="w-6 h-6" />
              </div>
            </GlassCard>

            <GlassCard className="p-5 border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">User Submissions</p>
                <p className="text-2xl font-extrabold text-white mt-1">{submissionsList.length}</p>
                <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {pendingSubmissionsCount} Pending Review
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </GlassCard>

            <GlassCard className="p-5 border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Support Chats</p>
                <p className="text-2xl font-extrabold text-white mt-1">{supportChats.length}</p>
                <p className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Real-time Support
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions & Recent User Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Balance Adjustment widget */}
            <GlassCard className="p-6 border-white/10 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-brand" />
                  <h3 className="text-base font-bold text-white">Quick Fund / Deduct</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Select an account to add or deduct simulated numbers in seconds.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Target Account</label>
                    <select
                      value={balanceUser}
                      onChange={(e) => setBalanceUser(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
                    >
                      {usersList.map((u) => (
                        <option key={u.username} value={u.username}>
                          {u.username} ({u.email}) - Current: ${u.realBalance?.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => triggerBalanceForUser(balanceUser, "add")}
                      className="py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Money
                    </button>
                    <button
                      onClick={() => triggerBalanceForUser(balanceUser, "deduct")}
                      className="py-2.5 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MinusCircle className="w-4 h-4" /> Deduct Money
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Total Registered Accounts:</span>
                <span className="font-bold text-white">{usersList.length}</span>
              </div>
            </GlassCard>

            {/* Recent Submissions preview */}
            <GlassCard className="p-6 border-white/10 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Recent Deposits & Withdrawals</h3>
                </div>
                <button
                  onClick={() => setActiveTab("submissions")}
                  className="text-xs text-brand hover:underline font-medium flex items-center gap-1"
                >
                  View all ({submissionsList.length}) <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {submissionsList.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No deposits or withdrawal submissions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-muted-foreground font-semibold">
                        <th className="pb-2">Type</th>
                        <th className="pb-2">User</th>
                        <th className="pb-2">Method & Details</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {submissionsList.slice(0, 5).map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.type === "deposit" ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400"
                            }`}>
                              {sub.type?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 font-medium text-white">{sub.username}</td>
                          <td className="py-2.5 text-muted-foreground">
                            {sub.method} • <span className="font-mono text-[11px]">{sub.reference}</span>
                          </td>
                          <td className="py-2.5 font-bold text-white">{sub.totalUsd || sub.amountVal}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              sub.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                              sub.status === "Cancelled" ? "bg-red-500/20 text-red-400" :
                              "bg-amber-500/20 text-amber-400"
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => { setInspectSubmission(sub); setActiveTab("submissions"); }}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: ALL ACCOUNTS (Usernames, Passwords, Emails, Details) */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "accounts" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-brand" /> Registered Accounts ({usersList.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                All user accounts, passwords, contact information, and balances.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search username, email, phone..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <button
                onClick={() => fetchAllAdminData()}
                title="Refresh accounts list"
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin text-brand" : ""}`} />
              </button>

              <button
                onClick={() => { setIsCreateUserOpen(true); setCreateUserError(""); }}
                className="px-3 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-brand/20 cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>

          <GlassCard className="p-0 border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/60 border-b border-white/10 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">User & Email</th>
                    <th className="px-4 py-3">Password</th>
                    <th className="px-4 py-3">Phone & Country</th>
                    <th className="px-4 py-3">Real USD Balance</th>
                    <th className="px-4 py-3">Crypto (BTC/USDT)</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                        No accounts matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isRevealed = revealedPasswords.has(u.username);
                      return (
                        <tr key={u.username} className="hover:bg-white/[0.03] transition-colors">
                          {/* User Info */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-bold text-xs">
                                {u.avatar || u.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.username}</span>
                                  {u.firstName && (
                                    <span className="text-[11px] text-muted-foreground font-normal">
                                      ({u.firstName} {u.lastName})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                                  <span>{u.email}</span>
                                  <button
                                    onClick={() => copyText(u.email, `email-${u.username}`)}
                                    title="Copy email"
                                    className="hover:text-white"
                                  >
                                    {copiedField === `email-${u.username}` ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Password */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-white/5 w-fit">
                              <span className="font-mono text-xs text-amber-300">
                                {isRevealed ? (u.password || "(empty)") : "••••••••"}
                              </span>
                              <button
                                onClick={() => togglePassword(u.username)}
                                title={isRevealed ? "Hide password" : "Show password"}
                                className="text-muted-foreground hover:text-white ml-1"
                              >
                                {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => copyText(u.password, `pass-${u.username}`)}
                                title="Copy password"
                                className="text-muted-foreground hover:text-white"
                              >
                                {copiedField === `pass-${u.username}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Phone & Country */}
                          <td className="px-4 py-3.5">
                            <div className="text-[11px] text-white">
                              {u.phone || <span className="text-muted-foreground italic">No phone</span>}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {u.country || "Not specified"} • {u.currency || "USD"}
                            </div>
                          </td>

                          {/* Real Balance */}
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-emerald-400 text-sm">
                              ${(u.realBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Crypto Balances */}
                          <td className="px-4 py-3.5">
                            <div className="text-[11px] text-white">
                              ₿ {(u.btcBalance || 0).toFixed(4)} BTC
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              ${(u.usdtBalance || 0).toLocaleString()} USDT
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === "Administrator" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-white/10 text-slate-300"
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => triggerBalanceForUser(u.username, "add")}
                                title="Add/Deduct balance"
                                className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <DollarSign className="w-3 h-3" /> Fund
                              </button>

                              <button
                                onClick={() => setInspectUser(u)}
                                title="View full user details & submissions"
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] transition-all cursor-pointer"
                              >
                                Details
                              </button>

                              {u.username.toLowerCase() !== activeAdmin?.username.toLowerCase() && (
                                <button
                                  onClick={() => handleDeleteUser(u.username)}
                                  title="Delete user"
                                  className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: ADD / DEDUCT FUNDS (Balance Control Manager) */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "balance" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-brand" /> Add or Deduct Account Funds
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select any user account to add, deduct, or set numerical simulation funds. Updates sync instantly.
            </p>
          </div>

          <GlassCard className="p-6 border-white/10 shadow-xl">
            {balanceSuccessMsg && (
              <div className="p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-semibold">{balanceSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleBalanceSubmit} className="space-y-5">
              {/* Account Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Select User Account
                </label>
                <select
                  required
                  value={balanceUser}
                  onChange={(e) => setBalanceUser(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand font-medium"
                >
                  <option value="" disabled>-- Select an account --</option>
                  {usersList.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username} ({u.email}) — Real Balance: ${u.realBalance?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Balances Card */}
              {selectedBalanceUserObj && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Real USD</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${selectedBalanceUserObj.realBalance?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">USDT</span>
                    <span className="font-bold text-white text-sm">
                      ${selectedBalanceUserObj.usdtBalance?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Bitcoin</span>
                    <span className="font-bold text-amber-400 text-sm">
                      ₿ {selectedBalanceUserObj.btcBalance?.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Demo USD</span>
                    <span className="font-bold text-blue-400 text-sm">
                      ${selectedBalanceUserObj.demoBalance?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Type: Add / Deduct / Set */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Operation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceOperation("add")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      balanceOperation === "add"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow"
                        : "bg-black/30 border-white/10 text-muted-foreground hover:text-white"
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" /> Add (+)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBalanceOperation("deduct")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      balanceOperation === "deduct"
                        ? "bg-red-500/20 border-red-500/50 text-red-400 shadow"
                        : "bg-black/30 border-white/10 text-muted-foreground hover:text-white"
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" /> Deduct (-)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBalanceOperation("set")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      balanceOperation === "set"
                        ? "bg-brand/20 border-brand/50 text-brand shadow"
                        : "bg-black/30 border-white/10 text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Settings className="w-4 h-4" /> Set Exact (=)
                  </button>
                </div>
              </div>

              {/* Asset Wallet to Adjust */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Asset / Wallet
                  </label>
                  <select
                    value={balanceAsset}
                    onChange={(e) => setBalanceAsset(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                  >
                    <option value="realBalance">Real USD Balance ($)</option>
                    <option value="usdtBalance">USDT ($)</option>
                    <option value="btcBalance">Bitcoin (BTC ₿)</option>
                    <option value="demoBalance">Demo Balance ($)</option>
                    <option value="stakedBalance">Staked Vault ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Amount (Numerical value)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      min="0.00000001"
                      placeholder="e.g. 5000"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Memo */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Transaction Note / Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Manual deposit confirmation, VIP bonus, adjustment"
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              {/* Calculated Preview */}
              {selectedBalanceUserObj && balanceAmount && !isNaN(parseFloat(balanceAmount)) && (
                <div className="p-3.5 rounded-xl bg-brand/10 border border-brand/20 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Operation Result Preview:</span>
                  <span className="font-bold text-white font-mono">
                    {balanceOperation === "add" ? (
                      <span className="text-emerald-400">
                        ${(selectedBalanceUserObj.realBalance + parseFloat(balanceAmount)).toLocaleString()} (+${parseFloat(balanceAmount).toLocaleString()})
                      </span>
                    ) : balanceOperation === "deduct" ? (
                      <span className="text-red-400">
                        ${Math.max(0, selectedBalanceUserObj.realBalance - parseFloat(balanceAmount)).toLocaleString()} (-${parseFloat(balanceAmount).toLocaleString()})
                      </span>
                    ) : (
                      <span className="text-brand font-bold">
                        Set to ${parseFloat(balanceAmount).toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={balanceSubmitting || !balanceUser}
                className="w-full py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-brand/20"
              >
                {balanceSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Apply Balance Adjustment</span>
              </button>
            </form>
          </GlassCard>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 4: SUBMISSIONS & USER INPUTS (Deposit & Withdrawal Inspector) */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "submissions" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-brand" /> User Submissions & Inputs ({submissionsList.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                View, create, edit, approve, or delete all Deposit and Withdrawal requests per user.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => {
                  setNewDepositUser(usersList[0]?.username || "");
                  setIsCreateDepositOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Deposit</span>
              </button>

              <select
                value={submissionUserFilter}
                onChange={(e) => setSubmissionUserFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="all">All Accounts</option>
                {usersList.map((u) => (
                  <option key={u.username} value={u.username}>User: {u.username}</option>
                ))}
              </select>

              <select
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="all">All Types & Status</option>
                <option value="deposit">Deposits Only</option>
                <option value="withdraw">Withdrawals Only</option>
                <option value="Pending">Pending Only</option>
                <option value="Approved">Approved Only</option>
                <option value="Cancelled">Cancelled Only</option>
              </select>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search user, ref, method..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          <GlassCard className="p-0 border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/60 border-b border-white/10 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">User & Email</th>
                    <th className="px-4 py-3">Method & Reference</th>
                    <th className="px-4 py-3">Amount Input</th>
                    <th className="px-4 py-3">Input Details</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                        No submissions matching filter. Click &quot;Create Deposit&quot; to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.type === "deposit" ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400"
                          }`}>
                            {sub.type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{sub.username}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{sub.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{sub.method}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{sub.reference}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-white">{sub.totalUsd || sub.amountVal}</span>
                          <span className="text-[10px] text-muted-foreground block">
                            {sub.amountVal} {sub.amountAsset}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {sub.details ? (
                            <div className="text-[11px] text-slate-300 truncate">
                              {sub.details.walletAddress && (
                                <span className="block font-mono text-[10px] text-brand truncate">
                                  Addr: {sub.details.walletAddress}
                                </span>
                              )}
                              {sub.details.bankName && (
                                <span className="block text-[10px]">
                                  Bank: {sub.details.bankName} (Acct: {sub.details.accountNumber || "N/A"})
                                </span>
                              )}
                              {sub.details.withdrawalCode && (
                                <span className="block text-[10px] text-amber-400">
                                  Code: {sub.details.withdrawalCode}
                                </span>
                              )}
                              {sub.details.adminNote && (
                                <span className="block text-[10px] text-brand truncate">
                                  Note: {sub.details.adminNote}
                                </span>
                              )}
                              {!sub.details.walletAddress && !sub.details.bankName && !sub.details.withdrawalCode && !sub.details.adminNote && (
                                <span className="text-muted-foreground italic">Standard submission</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">No extra inputs</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            sub.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                            sub.status === "Cancelled" ? "bg-red-500/20 text-red-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {sub.status !== "Approved" && (
                              <button
                                onClick={() => handleUpdateSubmissionStatus(sub.id, "Approved")}
                                title="Approve & Credit Balance"
                                className="p-1.5 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 rounded transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {sub.status !== "Cancelled" && (
                              <button
                                onClick={() => handleUpdateSubmissionStatus(sub.id, "Cancelled")}
                                title="Reject / Cancel"
                                className="p-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => openEditSubmission(sub)}
                              title="Edit Deposit"
                              className="p-1.5 bg-brand/15 hover:bg-brand/30 text-brand rounded transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setInspectSubmission(sub)}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id, sub.reference)}
                              title="Delete Submission"
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 5: SUPPORT CHATS (Live Real-Time Support Desk) */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "chats" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand" /> Live Support Hub ({supportChats.length} active sessions)
              </h2>
              <p className="text-xs text-muted-foreground">
                Live two-way real-time messaging console with user typing indicators.
              </p>
            </div>
            <button
              onClick={fetchAllAdminData}
              className="text-xs text-brand hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Conversations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[520px]">
            {/* Conversation List */}
            <GlassCard className="p-3 border-white/10 md:col-span-1 flex flex-col h-[540px]">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
                Active Client Conversations
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {sortedSupportChats.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    No active user support chats yet.
                  </div>
                ) : (
                  sortedSupportChats.map((chat) => {
                    const isActive = chat.id === (activeChatId || currentChat?.id);
                    const lastMsg = chat.messages?.[chat.messages.length - 1];
                    const isUserTyping = Boolean(chat.typing?.user);

                    return (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                          isActive
                            ? "bg-brand/20 border border-brand/40 text-white shadow-sm"
                            : "hover:bg-white/5 text-slate-300 border border-transparent"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-bold text-xs">
                            {chat.avatar || chat.username?.substring(0, 2).toUpperCase() || "??"}
                          </div>
                          {isUserTyping ? (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            </span>
                          ) : (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white truncate">{chat.name || chat.username}</span>
                            <span className="text-[10px] text-muted-foreground">{lastMsg?.time || ""}</span>
                          </div>

                          {isUserTyping ? (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-0.5">
                              <span className="inline-flex gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                              </span>
                              <span>Typing...</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {lastMsg ? `${lastMsg.senderType === "admin" ? "You: " : ""}${lastMsg.text}` : "Started chat"}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </GlassCard>

            {/* Active Chat Window */}
            <GlassCard className="p-0 border-white/10 md:col-span-2 flex flex-col h-[540px] overflow-hidden">
              {currentChat ? (
                <>
                  {/* Chat Top Header */}
                  <div className="p-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-bold text-xs">
                          {currentChat.avatar || currentChat.username?.substring(0, 2).toUpperCase() || "??"}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900"></span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{currentChat.name || currentChat.username}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({currentChat.username})
                          </span>
                        </h4>
                        {Boolean(currentChat.typing?.user) ? (
                          <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="inline-flex gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </span>
                            User is typing a message...
                          </p>
                        ) : (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Online
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerBalanceForUser(currentChat.username)}
                        className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Fund User
                      </button>
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-black/20 to-black/40">
                    {currentChat.messages?.map((msg: any) => {
                      const isAdmin = msg.senderType === "admin" || msg.sender === "Admin";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                        >
                          <div className="flex items-end gap-2 max-w-[80%]">
                            {!isAdmin && (
                              <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand text-[9px] font-bold shrink-0 mb-0.5">
                                {currentChat.avatar || currentChat.username?.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isAdmin
                                  ? "bg-brand text-white rounded-br-none shadow-md shadow-brand/10"
                                  : "bg-slate-800 text-slate-100 rounded-bl-none border border-white/10"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words break-all sm:break-words select-text">{msg.text}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] text-muted-foreground mt-1 px-1 ${isAdmin ? "text-right" : "text-left ml-8"}`}>
                            {isAdmin ? "Admin (You)" : currentChat.name} • {msg.time}
                          </span>
                        </div>
                      );
                    })}

                    {/* USER TYPING ANIMATION IN THREAD */}
                    <AnimatePresence>
                      {Boolean(currentChat.typing?.user) && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          className="flex items-end gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand text-[9px] font-bold shrink-0">
                            {currentChat.avatar || currentChat.username?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="p-3 rounded-2xl bg-slate-800 border border-white/10 rounded-bl-none flex items-center gap-2">
                            <div className="flex gap-1 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">{currentChat.name || currentChat.username} is typing...</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={chatEndRef} />
                  </div>

                  {/* Canned Quick Responses */}
                  <div className="px-3 py-1.5 bg-black/50 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      "Hello! How may I assist you today?",
                      "Your deposit has been verified & credited.",
                      "Your account balance has been updated.",
                      "Your verification has been approved.",
                      "Is there anything else I can help you with?",
                    ].map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleSendChatReply(reply)}
                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-brand/20 hover:text-brand text-[10px] text-muted-foreground whitespace-nowrap border border-white/5 transition-all cursor-pointer shrink-0"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Box */}
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendChatReply(); }}
                    className="p-3 bg-black/40 border-t border-white/10 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Reply to ${currentChat.name || currentChat.username} as Admin (typing indicator active)...`}
                      value={chatReplyText}
                      onChange={handleAdminInputChange}
                      style={{ fontSize: "16px" }}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-base text-white placeholder-muted-foreground focus:outline-none focus:border-brand"
                    />
                    <button
                      type="submit"
                      disabled={!chatReplyText.trim()}
                      className="p-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-brand/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
                  Select a chat conversation on the left to start replying.
                </div>
              )}
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 6: ACTIVITY LOGS */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === "logs" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-brand" /> System Activity Audit Stream ({logs.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time security audits, logins, transactions, and balance operations.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={logCategoryFilter}
                onChange={(e) => setLogCategoryFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="all">All Categories</option>
                <option value="security">Security & Auth</option>
                <option value="wallet">Wallet & Funds</option>
                <option value="trade">Trades</option>
                <option value="chat">Support Chat</option>
              </select>

              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          <GlassCard className="p-0 border-white/10 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/60 border-b border-white/10 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Action Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">IP & Location</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                        No activity logs matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-white">
                          {log.userName}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          {log.action}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 font-mono">
                            {log.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                          {log.ipAddress}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "success" ? "text-emerald-400 bg-emerald-500/15" :
                            log.status === "warning" ? "text-amber-400 bg-amber-500/15" :
                            "text-red-400 bg-red-500/15"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: USER DETAILS & SUBMISSIONS INSPECTOR */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {inspectUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-bold">
                    {inspectUser.avatar || inspectUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{inspectUser.username}</h3>
                    <p className="text-xs text-muted-foreground">{inspectUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectUser(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Password (Raw)</span>
                  <span className="font-mono font-bold text-amber-300 text-sm select-all">{inspectUser.password}</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Real Balance</span>
                  <span className="font-bold text-emerald-400 text-sm">${inspectUser.realBalance?.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Phone Number</span>
                  <span className="font-medium text-white">{inspectUser.phone || "None"}</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Country</span>
                  <span className="font-medium text-white">{inspectUser.country || "None"}</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Currency</span>
                  <span className="font-medium text-white">{inspectUser.currency || "USD"}</span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Referral Code</span>
                  <span className="font-medium text-white">{inspectUser.referralCode || "None"}</span>
                </div>
              </div>

              {/* Submissions by this user */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Deposit & Withdrawal Activity ({inspectUser.submissions?.length || 0})
                </h4>
                {(!inspectUser.submissions || inspectUser.submissions.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic py-3">No submissions yet for this account.</p>
                ) : (
                  <div className="space-y-2">
                    {inspectUser.submissions.map((s: any) => (
                      <div key={s.id} className="p-3 bg-black/30 rounded-xl border border-white/5 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">
                            {s.type?.toUpperCase()} — {s.totalUsd || s.amountVal}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {s.method} • Ref: {s.reference}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.status === "Approved" ? "bg-emerald-500/20 text-emerald-400" :
                          s.status === "Cancelled" ? "bg-red-500/20 text-red-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const uname = inspectUser.username;
                    setInspectUser(null);
                    triggerBalanceForUser(uname, "add");
                  }}
                  className="flex-1 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" /> Fund This Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: SUBMISSION DETAILS INSPECTOR */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {inspectSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-brand" /> Submission Details
                </h3>
                <button onClick={() => setInspectSubmission(null)} className="text-muted-foreground hover:text-white cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-bold text-white">{inspectSubmission.username} ({inspectSubmission.email})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-bold uppercase text-brand">{inspectSubmission.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Reference ID:</span>
                  <span className="font-mono text-white select-all">{inspectSubmission.reference}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-emerald-400">{inspectSubmission.totalUsd} ({inspectSubmission.amountVal} {inspectSubmission.amountAsset})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="text-white">{inspectSubmission.method}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-muted-foreground">Current Status:</span>
                  <span className="font-bold text-amber-400">{inspectSubmission.status}</span>
                </div>

                {inspectSubmission.details && (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1.5 mt-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">User Input Payload</span>
                    {Object.entries(inspectSubmission.details).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-mono text-white select-all">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const sub = inspectSubmission;
                    setInspectSubmission(null);
                    openEditSubmission(sub);
                  }}
                  className="flex-1 py-2 bg-brand/20 hover:bg-brand/30 text-brand border border-brand/30 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Record
                </button>
                {inspectSubmission.status !== "Approved" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateSubmissionStatus(inspectSubmission.id, "Approved");
                      setInspectSubmission(null);
                    }}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                )}
                {inspectSubmission.status !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateSubmissionStatus(inspectSubmission.id, "Cancelled");
                      setInspectSubmission(null);
                    }}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const id = inspectSubmission.id;
                    const ref = inspectSubmission.reference;
                    handleDeleteSubmission(id, ref);
                  }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-colors cursor-pointer"
                  title="Delete Submission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: CREATE DEPOSIT / SUBMISSION FOR ANY USER */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {isCreateDepositOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" /> Create Deposit / Ledger Record
                </h3>
                <button onClick={() => setIsCreateDepositOpen(false)} className="text-muted-foreground hover:text-white cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDepositSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Target User Account</label>
                  <select
                    value={newDepositUser}
                    onChange={(e) => setNewDepositUser(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand cursor-pointer"
                    required
                  >
                    <option value="">-- Select User --</option>
                    {usersList.map((u) => (
                      <option key={u.username} value={u.username}>
                        {u.username} ({u.email || "No Email"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Entry Type</label>
                    <select
                      value={newDepositType}
                      onChange={(e) => setNewDepositType(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="deposit">Deposit</option>
                      <option value="withdraw">Withdrawal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Status</label>
                    <select
                      value={newDepositStatus}
                      onChange={(e) => setNewDepositStatus(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="Approved">Approved (Completed)</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Amount Value</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 500.00"
                      value={newDepositAmount}
                      onChange={(e) => setNewDepositAmount(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:border-brand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Asset Currency</label>
                    <select
                      value={newDepositAsset}
                      onChange={(e) => setNewDepositAsset(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="USDT">USDT (Tether)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="SOL">SOL (Solana)</option>
                      <option value="USD">USD (Fiat)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Payment Method Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Bitcoin Network, Bank Wire, Visa/Mastercard"
                    value={newDepositMethod}
                    onChange={(e) => setNewDepositMethod(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Reference ID (Leave blank to auto-generate)</label>
                  <input
                    type="text"
                    placeholder="e.g. DEP-918230"
                    value={newDepositRef}
                    onChange={(e) => setNewDepositRef(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono placeholder-muted-foreground focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Admin Notes / Payload</label>
                  <input
                    type="text"
                    placeholder="e.g. Verified blockchain txhash, manual administrative credit"
                    value={newDepositNote}
                    onChange={(e) => setNewDepositNote(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:border-brand"
                  />
                </div>

                {newDepositStatus === "Approved" && newDepositType === "deposit" && (
                  <label className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newDepositCreditBalance}
                      onChange={(e) => setNewDepositCreditBalance(e.target.checked)}
                      className="w-4 h-4 rounded text-brand focus:ring-brand"
                    />
                    <span className="text-xs text-emerald-300 font-medium">
                      Also automatically credit user&apos;s live account balance with this amount
                    </span>
                  </label>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateDepositOpen(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingDeposit}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingDeposit ? "Saving..." : "Create Deposit Record"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: EDIT SUBMISSION / DEPOSIT RECORD */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {isEditDepositOpen && editingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-brand" /> Edit Submission Record ({editingSubmission.reference})
                </h3>
                <button onClick={() => setIsEditDepositOpen(false)} className="text-muted-foreground hover:text-white cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditSubmission} className="space-y-3.5 text-xs">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase block font-semibold">User Account</span>
                    <span className="font-bold text-white text-sm">{editingSubmission.username}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/20 text-brand uppercase">
                    {editingSubmission.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Amount Value</label>
                    <input
                      type="text"
                      value={editAmountVal}
                      onChange={(e) => setEditAmountVal(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Asset Currency</label>
                    <input
                      type="text"
                      value={editAmountAsset}
                      onChange={(e) => setEditAmountAsset(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Total (USD)</label>
                    <input
                      type="text"
                      value={editTotalUsd}
                      onChange={(e) => setEditTotalUsd(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Reference ID</label>
                  <input
                    type="text"
                    value={editReference}
                    onChange={(e) => setEditReference(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Admin Notes</label>
                  <textarea
                    rows={2}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand resize-none"
                    placeholder="Admin explanation or status note..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteSubmission(editingSubmission.id, editingSubmission.reference)}
                    className="p-2.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditDepositOpen(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="flex-1 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-bold transition-all shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal 4: Create User Account */}
        {isCreateUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#111318] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Create New Account</h3>
                    <p className="text-[11px] text-muted-foreground">Add a new user with instant balance provisioning</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateUserOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {createUserError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createUserError}</span>
                </div>
              )}

              <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Username / Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe"
                    value={newUserUname}
                    onChange={(e) => setNewUserUname(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="Minimum 6 characters"
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Account Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="User">User (Standard)</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Base Currency</label>
                    <select
                      value={newUserCurrency}
                      onChange={(e) => setNewUserCurrency(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      placeholder="e.g. United States"
                      value={newUserCountry}
                      onChange={(e) => setNewUserCountry(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 555-0199"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[11px] font-bold text-white mb-2">Initial Starting Balance (Optional)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted-foreground font-semibold mb-1">Real USD ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={newUserRealBal}
                        onChange={(e) => setNewUserRealBal(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground font-semibold mb-1">BTC (₿)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={newUserBtcBal}
                        onChange={(e) => setNewUserBtcBal(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateUserOpen(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="flex-1 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-bold transition-all shadow-md shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isCreatingUser ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
