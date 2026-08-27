import fs from "fs";
import os from "os";
import path from "path";
import { EventEmitter } from "events";

let cachedDataDir: string | null = null;

/** Resolve a writable data directory (works on serverless production where cwd/data is read-only). */
const getDataDir = (): string => {
  if (cachedDataDir) return cachedDataDir;

  const candidates = [
    path.join(process.cwd(), "data"),
    path.join(os.tmpdir(), "b2b-data"),
  ];

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const probe = path.join(dir, ".write-probe");
      fs.writeFileSync(probe, "ok", "utf-8");
      fs.unlinkSync(probe);
      cachedDataDir = dir;
      return dir;
    } catch {
      // try next candidate
    }
  }

  cachedDataDir = path.join(os.tmpdir(), "b2b-data");
  if (!fs.existsSync(cachedDataDir)) {
    fs.mkdirSync(cachedDataDir, { recursive: true });
  }
  return cachedDataDir;
};

// Global Event Emitter for real-time SSE stream push
export const logEmitter = new EventEmitter();

// Max listeners setting
logEmitter.setMaxListeners(100);

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

const filePath = (name: string) => path.join(getDataDir(), name);

const ensureDataFolder = () => {
  getDataDir();
};

// Get all logs from server JSON file
export const getServerLogs = (): ActivityLog[] => {
  ensureDataFolder();
  try {
    const logsPath = filePath("logs.json");
    if (!fs.existsSync(logsPath)) {
      const bundledPath = path.join(process.cwd(), "data", "logs.json");
      if (fs.existsSync(bundledPath)) {
        try {
          const bundled = fs.readFileSync(bundledPath, "utf-8");
          fs.writeFileSync(logsPath, bundled, "utf-8");
          return JSON.parse(bundled);
        } catch {
          // fall through
        }
      }
      const initialLogs: ActivityLog[] = [];
      fs.writeFileSync(logsPath, JSON.stringify(initialLogs, null, 2), "utf-8");
      return initialLogs;
    }
    const data = fs.readFileSync(logsPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading server logs:", err);
    return [];
  }
};

// Add a single log to server JSON file
export const addServerLog = (logData: Omit<ActivityLog, "id" | "timestamp">): ActivityLog => {
  ensureDataFolder();
  const logs = getServerLogs();
  
  const newLog: ActivityLog = {
    ...logData,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString()
  };

  logs.unshift(newLog); // Keep latest logs at top

  // Keep list at maximum 200 logs to avoid filesystem exhaustion
  if (logs.length > 200) {
    logs.length = 200;
  }

  try {
    fs.writeFileSync(filePath("logs.json"), JSON.stringify(logs, null, 2), "utf-8");
    // Emit new-log event to any open EventSource handlers
    logEmitter.emit("new-log", newLog);
  } catch (err) {
    console.error("Error writing server log:", err);
  }

  return newLog;
};

// Purge all logs
export const clearServerLogs = () => {
  ensureDataFolder();
  try {
    const cleared: ActivityLog[] = [];
    fs.writeFileSync(filePath("logs.json"), JSON.stringify(cleared, null, 2), "utf-8");
    logEmitter.emit("clear-logs");
  } catch (err) {
    console.error("Error clearing server logs:", err);
  }
};

// Utility to parse request body safely in API routes
export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

// Verify Admin login from server users database
export const getAdminUsers = () => {
  ensureDataFolder();
  try {
    const usersPath = filePath("users.json");
    if (!fs.existsSync(usersPath)) {
      // Seed from bundled data on first run (e.g. fresh serverless instance)
      const bundledPath = path.join(process.cwd(), "data", "users.json");
      if (fs.existsSync(bundledPath)) {
        try {
          const bundled = fs.readFileSync(bundledPath, "utf-8");
          fs.writeFileSync(usersPath, bundled, "utf-8");
          return JSON.parse(bundled);
        } catch {
          // fall through to empty list
        }
      }
      const defaultAdmins: any[] = [];
      fs.writeFileSync(usersPath, JSON.stringify(defaultAdmins, null, 2), "utf-8");
      return defaultAdmins;
    }
    const data = fs.readFileSync(usersPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading admin users:", err);
    return [];
  }
};

// Save updated admin users list to disk
export const saveAdminUsers = (users: any[]) => {
  ensureDataFolder();
  try {
    fs.writeFileSync(filePath("users.json"), JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving admin users:", err);
  }
};


export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  senderType: "user" | "admin";
}

export interface TypingStatus {
  user?: boolean;
  admin?: boolean;
  userLastTyped?: number;
  adminLastTyped?: number;
}

export interface SupportChat {
  id: string;
  name: string;
  username: string;
  avatar: string;
  color: string;
  status: "Online" | "Offline";
  messages: ChatMessage[];
  lastUpdated: string;
  typing?: TypingStatus;
}

declare global {
  var __chats_cache__: SupportChat[] | undefined;
}

export const getChats = (): SupportChat[] => {
  ensureDataFolder();
  try {
    const chatsPath = filePath("chats.json");
    if (!fs.existsSync(chatsPath)) {
      const bundledPath = path.join(process.cwd(), "data", "chats.json");
      if (fs.existsSync(bundledPath)) {
        try {
          const bundled = fs.readFileSync(bundledPath, "utf-8");
          const parsed = JSON.parse(bundled);
          fs.writeFileSync(chatsPath, bundled, "utf-8");
          globalThis.__chats_cache__ = parsed;
          return parsed;
        } catch {
          // fall through
        }
      }
      const initialChats: SupportChat[] = [];
      fs.writeFileSync(chatsPath, JSON.stringify(initialChats, null, 2), "utf-8");
      globalThis.__chats_cache__ = initialChats;
      return initialChats;
    }
    const data = fs.readFileSync(chatsPath, "utf-8");
    const parsed = JSON.parse(data);
    globalThis.__chats_cache__ = parsed;
    return parsed;
  } catch (err) {
    if (globalThis.__chats_cache__) {
      return globalThis.__chats_cache__;
    }
    console.error("Error reading chats file:", err);
    return [];
  }
};

export const saveChats = (chats: SupportChat[]) => {
  ensureDataFolder();
  globalThis.__chats_cache__ = chats;
  try {
    fs.writeFileSync(filePath("chats.json"), JSON.stringify(chats, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing chats file:", err);
  }
};


export interface Submission {
  id: string;
  type: "deposit" | "withdraw";
  username: string;
  email: string;
  reference: string;
  method: string;
  amountVal: string;
  amountAsset: string;
  totalUsd: string;
  status: "Pending" | "Approved" | "Cancelled";
  details?: Record<string, unknown>;
  createdAt: string;
}

export const getSubmissions = (): Submission[] => {
  ensureDataFolder();
  try {
    const submissionsPath = filePath("submissions.json");
    if (!fs.existsSync(submissionsPath)) {
      const bundledPath = path.join(process.cwd(), "data", "submissions.json");
      if (fs.existsSync(bundledPath)) {
        try {
          const bundled = fs.readFileSync(bundledPath, "utf-8");
          fs.writeFileSync(submissionsPath, bundled, "utf-8");
          return JSON.parse(bundled);
        } catch {
          // fall through
        }
      }
      fs.writeFileSync(submissionsPath, "[]", "utf-8");
      return [];
    }
    return JSON.parse(fs.readFileSync(submissionsPath, "utf-8"));
  } catch (err) {
    console.error("Error reading submissions:", err);
    return [];
  }
};

export const addSubmission = (submission: Omit<Submission, "id" | "createdAt">): Submission => {
  ensureDataFolder();
  const submissions = getSubmissions();
  const newSubmission: Submission = {
    ...submission,
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  submissions.unshift(newSubmission);
  try {
    fs.writeFileSync(filePath("submissions.json"), JSON.stringify(submissions, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing submissions:", err);
  }
  return newSubmission;
};

export const saveSubmissions = (submissions: Submission[]) => {
  ensureDataFolder();
  try {
    fs.writeFileSync(filePath("submissions.json"), JSON.stringify(submissions, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing submissions file:", err);
  }
};

export const updateSubmissionStatus = (id: string, status: "Approved" | "Pending" | "Cancelled", note?: string): Submission | null => {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  submissions[index].status = status;
  if (note) {
    submissions[index].details = {
      ...(submissions[index].details || {}),
      adminNote: note,
      statusUpdatedAt: new Date().toISOString(),
    };
  }
  saveSubmissions(submissions);
  return submissions[index];
};

export const updateUserBalance = (
  username: string,
  operation: "add" | "deduct" | "set",
  asset: "realBalance" | "usdtBalance" | "btcBalance" | "demoBalance" | "stakedBalance" | "miningEarnings",
  amount: number,
  note?: string,
  skipSubmissionLog?: boolean
) => {
  const users = getAdminUsers();
  const user = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  const currentVal = typeof user[asset] === "number" ? user[asset] : (asset === "realBalance" || asset === "usdtBalance" ? (user.username.toLowerCase() === "jjj" ? 100000 : 0) : 0);

  let newVal = currentVal;
  if (operation === "add") {
    newVal = currentVal + amount;
  } else if (operation === "deduct") {
    newVal = Math.max(0, currentVal - amount);
  } else if (operation === "set") {
    newVal = Math.max(0, amount);
  }

  user[asset] = newVal;
  // Keep realBalance and usdtBalance in sync if one is changed
  if (asset === "realBalance") user.usdtBalance = newVal;
  if (asset === "usdtBalance") user.realBalance = newVal;

  saveAdminUsers(users);

  // Automatically record money added by admin into the deposit history ledger
  if (operation === "add" && !skipSubmissionLog) {
    try {
      const isBtc = asset === "btcBalance";
      const isDemo = asset === "demoBalance";
      const isStaked = asset === "stakedBalance";
      const assetSymbol = isBtc ? "BTC" : isDemo ? "USD (Demo)" : isStaked ? "USDT (Staking)" : "USDT";
      const usdTotal = isBtc ? (amount * 63000).toFixed(2) : amount.toFixed(2);
      const refCode = "ADM" + Math.floor(100000 + Math.random() * 900000);

      addSubmission({
        type: "deposit",
        username: user.username,
        email: user.email || `${user.username}@user.net`,
        reference: refCode,
        method: "Admin Credit",
        amountVal: amount.toString(),
        amountAsset: assetSymbol,
        totalUsd: `$${usdTotal}`,
        status: "Approved",
        details: {
          type: "Direct Credit",
          source: "Administrator",
          note: note || "Admin balance credit adjustment",
          processedAt: new Date().toISOString(),
          balanceCredited: true,
        },
      });
    } catch (subErr) {
      console.error("Error creating auto-deposit on balance add:", subErr);
    }
  }

  addServerLog({
    userId: `usr-${user.username}`,
    userName: user.username,
    userEmail: user.email || "",
    userRole: user.role || "User",
    avatar: user.avatar || "??",
    action: `Balance adjustment (${operation.toUpperCase()} ${amount} ${asset}): Old=${currentVal}, New=${newVal}`,
    category: "wallet",
    status: "success",
    severity: "info",
    ipAddress: "127.0.0.1",
    location: "Admin Control",
    browser: "Admin Dashboard",
    details: {
      operation,
      asset,
      amount,
      previousBalance: currentVal,
      newBalance: newVal,
      note: note || "Admin numerical balance adjustment",
    },
  });

  return user;
};

export const deleteAdminUser = (username: string): boolean => {
  const users = getAdminUsers();
  const filtered = users.filter((u: any) => u.username?.toLowerCase() !== username.toLowerCase());
  if (filtered.length === users.length) return false;
  saveAdminUsers(filtered);
  return true;
};

export const updateAdminUser = (username: string, updates: Record<string, any>) => {
  const users = getAdminUsers();
  const user = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  Object.assign(user, updates);
  saveAdminUsers(users);
  return user;
};

