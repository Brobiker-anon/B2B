"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  username: string;
  email: string;
  role: string;
  avatar: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  phone?: string;
  currency?: string;
  realBalance?: number;
  usdtBalance?: number;
  btcBalance?: number;
  demoBalance?: number;
  stakedBalance?: number;
  miningEarnings?: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Wallet state
  walletConnected: boolean;
  walletAddress: string | null;
  connectWallet: (walletName: string) => void;
  disconnectWallet: () => void;
  
  // KYC verification
  kycLevel: number;
  setKycLevel: (level: number) => void;
  
  // Subscription Plan
  userPlan: "Free" | "Pro" | "Enterprise";
  setUserPlan: (plan: "Free" | "Pro" | "Enterprise") => void;

  // Account Type & Balances
  accountType: "REAL" | "DEMO";
  setAccountType: (type: "REAL" | "DEMO") => void;
  realBalance: number;
  setRealBalance: React.Dispatch<React.SetStateAction<number>>;
  demoBalance: number;
  setDemoBalance: React.Dispatch<React.SetStateAction<number>>;

  // Global balances (shared across trade, assets, staking, mining, etc.)
  usdtBalance: number;
  setUsdtBalance: React.Dispatch<React.SetStateAction<number>>;
  btcBalance: number;
  setBtcBalance: React.Dispatch<React.SetStateAction<number>>;
  stakedBalance: number;
  setStakedBalance: React.Dispatch<React.SetStateAction<number>>;
  miningEarnings: number;
  setMiningEarnings: React.Dispatch<React.SetStateAction<number>>;

  // Toast system
  toasts: Toast[];
  addToast: (message: string, type: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulated Web3 States
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [kycLevel, setKycLevel] = useState(1);
  const [userPlan, setUserPlan] = useState<"Free" | "Pro" | "Enterprise">("Free");
  
  // Account Type & Balances — realBalance is the source of truth shown in the top bar
  const [accountType, setAccountType] = useState<"REAL" | "DEMO">("REAL");
  const [realBalance, setRealBalance] = useState(0);
  const [demoBalance, setDemoBalance] = useState(0);
  
  // Balances kept in sync with active account
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [miningEarnings, setMiningEarnings] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync user balances when active user changes or logs in
  useEffect(() => {
    if (!user?.username) {
      setRealBalance(0);
      setDemoBalance(0);
      setUsdtBalance(0);
      setBtcBalance(0);
      setStakedBalance(0);
      setMiningEarnings(0);
      return;
    }

    const isMaster = user.username.toLowerCase() === "jjj";

    // First preference: values delivered directly from live server session (MongoDB Atlas)
    if (typeof user.realBalance === "number") {
      setRealBalance(user.realBalance);
      setDemoBalance(typeof user.demoBalance === "number" ? user.demoBalance : (isMaster ? 100000 : 0));
      setUsdtBalance(typeof user.usdtBalance === "number" ? user.usdtBalance : user.realBalance);
      setBtcBalance(typeof user.btcBalance === "number" ? user.btcBalance : (isMaster ? 2.45 : 0));
      setStakedBalance(typeof user.stakedBalance === "number" ? user.stakedBalance : (isMaster ? 45200 : 0));
      setMiningEarnings(typeof user.miningEarnings === "number" ? user.miningEarnings : (isMaster ? 12.4582 : 0));
      return;
    }

    const storageKey = `brokerage_balances_${user.username.toLowerCase()}`;
    const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRealBalance(parsed.realBalance ?? (isMaster ? 100000 : 0));
        setDemoBalance(parsed.demoBalance ?? (isMaster ? 100000 : 0));
        setUsdtBalance(parsed.usdtBalance ?? (parsed.realBalance ?? (isMaster ? 100000 : 0)));
        setBtcBalance(parsed.btcBalance ?? (isMaster ? 2.45 : 0));
        setStakedBalance(parsed.stakedBalance ?? (isMaster ? 45200 : 0));
        setMiningEarnings(parsed.miningEarnings ?? (isMaster ? 12.4582 : 0));
        return;
      } catch {}
    }

    const initialReal = isMaster ? 100000 : 0;
    const initialDemo = isMaster ? 100000 : 0;
    const initialBtc = isMaster ? 2.45 : 0;
    const initialStaked = isMaster ? 45200 : 0;
    const initialMining = isMaster ? 12.4582 : 0;

    setRealBalance(initialReal);
    setDemoBalance(initialDemo);
    setUsdtBalance(initialReal);
    setBtcBalance(initialBtc);
    setStakedBalance(initialStaked);
    setMiningEarnings(initialMining);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          realBalance: initialReal,
          demoBalance: initialDemo,
          usdtBalance: initialReal,
          btcBalance: initialBtc,
          stakedBalance: initialStaked,
          miningEarnings: initialMining,
        })
      );
    }
  }, [user?.username, user?.realBalance, user?.demoBalance, user?.usdtBalance, user?.btcBalance, user?.stakedBalance, user?.miningEarnings]);

  // Persist updated balances to localStorage for active user
  useEffect(() => {
    if (!user?.username || typeof window === "undefined") return;
    const storageKey = `brokerage_balances_${user.username.toLowerCase()}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        realBalance,
        demoBalance,
        usdtBalance,
        btcBalance,
        stakedBalance,
        miningEarnings,
      })
    );
  }, [realBalance, demoBalance, usdtBalance, btcBalance, stakedBalance, miningEarnings, user?.username]);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (data.user.role === "Administrator") {
            setUserPlan("Pro");
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Keep legacy usdtBalance in sync with the active REAL account balance
  useEffect(() => {
    if (accountType === "REAL") {
      setUsdtBalance(realBalance);
    }
  }, [realBalance, accountType]);

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        setUser(null);
        addToast("Logged out successfully", "success");
        router.push("/");
        router.refresh();
      } else {
        addToast("Logout failed. Please try again.", "error");
      }
    } catch {
      addToast("Network error during logout", "error");
    }
  };

  const connectWallet = (walletName: string) => {
    setWalletConnected(true);
    const fakeAddress = "0x" + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const formattedAddress = fakeAddress.substring(0, 6) + "..." + fakeAddress.substring(38);
    setWalletAddress(formattedAddress);
    addToast(`Connected to ${walletName} (${formattedAddress})`, "success");
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    addToast("Wallet disconnected", "info");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        checkSession,
        logout,
        walletConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
        kycLevel,
        setKycLevel,
        userPlan,
        setUserPlan,
        accountType,
        setAccountType,
        realBalance,
        setRealBalance,
        demoBalance,
        setDemoBalance,
        usdtBalance,
        setUsdtBalance,
        btcBalance,
        setBtcBalance,
        stakedBalance,
        setStakedBalance,
        miningEarnings,
        setMiningEarnings,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
