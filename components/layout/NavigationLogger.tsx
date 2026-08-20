"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationLogger() {
  const pathname = usePathname();
  const lastPathnameRef = useRef<string | null>(null);

  const postTelemetryLog = async (
    action: string, 
    category: string, 
    status: "success" | "warning" | "failed", 
    severity: "info" | "warning" | "error" | "critical", 
    details?: any
  ) => {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: "usr-john-doe",
          userName: "John Doe",
          userEmail: "john.doe@brokerage.com",
          userRole: "Retail Investor",
          avatar: "JD",
          action,
          category,
          status,
          severity,
          ipAddress: "192.168.1.104",
          location: "New York, USA",
          browser: typeof navigator !== "undefined" ? navigator.userAgent : "Node SSR Client",
          details: details || {}
        })
      });
    } catch (err) {
      console.error("Telemetry Logging Node Sync failure:", err);
    }
  };

  useEffect(() => {
    // Avoid double logging on component mounting
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    // Skip tracking the admin logs panel to avoid logging clutter when viewing admin log feed
    if (pathname.startsWith("/admin")) {
      postTelemetryLog(
        "Administrator accessed Central Activity Audit logs", 
        "security", 
        "success", 
        "warning", 
        { path: pathname }
      );
      return;
    }

    let action = `Navigated to ${pathname}`;
    let category: 'trade' | 'wallet' | 'security' | 'chat' | 'system' | 'mining' | 'real-estate' | 'staking' | 'referrals' = "system";

    switch (pathname) {
      case "/":
        action = "User viewed Portfolio Dashboard";
        category = "system";
        break;
      case "/trade":
        action = "User accessed Trade Execution terminal";
        category = "trade";
        break;
      case "/markets":
        action = "User viewed Real-Time Markets Board";
        category = "trade";
        break;
      case "/assets":
        action = "User opened Asset Allocation ledger";
        category = "wallet";
        break;
      case "/investing":
        action = "User viewed High-Yield Investing options";
        category = "trade";
        break;
      case "/deposit":
        action = "User navigated to Deposit & Wallet Transfer dashboard";
        category = "wallet";
        break;
      case "/cold-storage":
        action = "User opened Institutional Cold Storage settings";
        category = "security";
        break;
      case "/copy-trading":
        action = "User viewed Copy Trading network board";
        category = "referrals";
        break;
      case "/mining":
        action = "User checked Cloud Mining performance panel";
        category = "mining";
        break;
      case "/real-estate":
        action = "User viewed Fractional Real Estate investments";
        category = "real-estate";
        break;
      case "/stake":
        action = "User navigated to Staking & Lockups manager";
        category = "staking";
        break;
      case "/signals":
        action = "User viewed Premium Signals scanner";
        category = "trade";
        break;
      case "/subscribe":
        action = "User checked Crown VIP Subscription benefits";
        category = "trade";
        break;
      case "/referrals":
        action = "User opened Referrals & Affiliates portal";
        category = "referrals";
        break;
      case "/chat":
        action = "User joined BrokerageX Community Chat lounge";
        category = "chat";
        break;
      case "/settings":
        action = "User opened Profile & Security Settings console";
        category = "security";
        break;
      default:
        action = `User accessed path: ${pathname}`;
        category = "system";
    }

    postTelemetryLog(action, category, "success", "info", { path: pathname });
  }, [pathname]);

  return null; // Pure functional layout logger
}
