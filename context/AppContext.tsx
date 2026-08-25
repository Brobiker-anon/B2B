"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface User {
  username: string;
  email: string;
  role: string;
  avatar: string;
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
  const [realBalance, setRealBalance] = useState(100000);
  const [demoBalance, setDemoBalance] = useState(100000);
  
  // Legacy balances kept in sync with active account
  const [usdtBalance, setUsdtBalance] = useState(100000);
  const [btcBalance, setBtcBalance] = useState(2.45);
  const [stakedBalance, setStakedBalance] = useState(45200);
  const [miningEarnings, setMiningEarnings] = useState(12.4582);

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

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          // If the user's role is Administrator, let's keep their plan as Pro
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
    // Generate a random-looking hex address
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
