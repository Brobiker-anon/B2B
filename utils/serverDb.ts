import { EventEmitter } from "events";
import {
  getMongoChats,
  saveAllMongoChats,
  saveMongoChat,
  getMongoUsers,
  getMongoUser,
  saveAllMongoUsers,
  saveMongoUser,
  deleteMongoUser,
  getMongoSubmissions,
  saveMongoSubmission,
  deleteMongoSubmission,
  getMongoLogs,
  addMongoLog,
  clearMongoLogs,
} from "./mongoDb";

// Global Event Emitter for real-time SSE stream push
export const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(50);

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

// In-Memory Fast Cache for serverless requests
declare global {
  var __users_cache__: any[] | undefined;
  var __chats_cache__: SupportChat[] | undefined;
  var __submissions_cache__: Submission[] | undefined;
  var __logs_cache__: ActivityLog[] | undefined;
}

// -------------------------------------------------------------
// LOGS REPOSITORY
// -------------------------------------------------------------
export const getServerLogs = async (): Promise<ActivityLog[]> => {
  try {
    const mongoLogs = await getMongoLogs();
    if (mongoLogs && mongoLogs.length > 0) {
      globalThis.__logs_cache__ = mongoLogs;
      return mongoLogs;
    }
  } catch (err) {
    console.error("Error reading logs from MongoDB:", err);
  }
  return globalThis.__logs_cache__ || [];
};

export const addServerLog = async (logData: Omit<ActivityLog, "id" | "timestamp">): Promise<ActivityLog> => {
  const newLog: ActivityLog = {
    ...logData,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };

  if (!globalThis.__logs_cache__) globalThis.__logs_cache__ = [];
  globalThis.__logs_cache__.unshift(newLog);
  if (globalThis.__logs_cache__.length > 100) {
    globalThis.__logs_cache__.length = 100;
  }

  // Persist to MongoDB Atlas asynchronously
  addMongoLog(newLog).catch((err) => console.error("Error saving log to MongoDB:", err));

  // Push to active SSE subscribers
  try {
    logEmitter.emit("new-log", newLog);
  } catch {}

  return newLog;
};

export const clearServerLogs = async () => {
  globalThis.__logs_cache__ = [];
  clearMongoLogs().catch((err) => console.error("Error clearing logs in MongoDB:", err));
  try {
    logEmitter.emit("clear-logs");
  } catch {}
};

// Utility to parse request body safely
export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

import fs from "fs";
import path from "path";

// Helper to safely read users from data/users.json
function readDiskUsers(): any[] {
  try {
    const filePath = path.join(process.cwd(), "data", "users.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Error reading data/users.json:", err);
  }
  return [];
}

// Helper to safely write users to data/users.json
function writeDiskUsers(users: any[]) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "users.json");
    const cleanUsers = users.map((u) => {
      const { _id, ...rest } = u;
      return rest;
    });
    fs.writeFileSync(filePath, JSON.stringify(cleanUsers, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing data/users.json:", err);
  }
}

// -------------------------------------------------------------
// ADMIN / USER REPOSITORY (MongoDB Atlas + Local Resilient Store)
// -------------------------------------------------------------
export const getAdminUsers = async (): Promise<any[]> => {
  const diskUsers = readDiskUsers();
  let mongoUsers: any[] = [];

  try {
    mongoUsers = await getMongoUsers();
  } catch (err) {
    console.error("Error fetching users from MongoDB:", err);
  }

  // Merge MongoDB users, disk users, and in-memory cache users
  const userMap = new Map<string, any>();

  // 1. Add disk users
  for (const u of diskUsers) {
    if (u?.username) {
      userMap.set(u.username.toLowerCase(), u);
    }
  }

  // 2. Add in-memory cache users
  if (globalThis.__users_cache__ && Array.isArray(globalThis.__users_cache__)) {
    for (const u of globalThis.__users_cache__) {
      if (u?.username) {
        userMap.set(u.username.toLowerCase(), {
          ...(userMap.get(u.username.toLowerCase()) || {}),
          ...u,
        });
      }
    }
  }

  // 3. Add / overwrite with live MongoDB users (authoritative)
  for (const u of mongoUsers) {
    if (u?.username) {
      userMap.set(u.username.toLowerCase(), {
        ...(userMap.get(u.username.toLowerCase()) || {}),
        ...u,
      });
    }
  }

  const mergedUsers = Array.from(userMap.values());
  globalThis.__users_cache__ = mergedUsers;

  // Persist combined users to disk for guaranteed recovery
  if (mergedUsers.length > 0) {
    writeDiskUsers(mergedUsers);
  }

  return mergedUsers;
};

export const saveAdminUsers = async (users: any[]) => {
  globalThis.__users_cache__ = users;
  writeDiskUsers(users);
  saveAllMongoUsers(users).catch((err) => console.error("Error batch saving users to MongoDB:", err));
};

export const saveSingleUser = async (user: any) => {
  const { _id, ...cleanUserData } = user;
  const usernameKey = String(cleanUserData.username || "").toLowerCase();

  if (!globalThis.__users_cache__) globalThis.__users_cache__ = [];
  const idx = globalThis.__users_cache__.findIndex(
    (u) => u.username?.toLowerCase() === usernameKey
  );
  if (idx > -1) {
    globalThis.__users_cache__[idx] = { ...globalThis.__users_cache__[idx], ...cleanUserData };
  } else {
    globalThis.__users_cache__.push(cleanUserData);
  }

  // Immediate disk persistence
  writeDiskUsers(globalThis.__users_cache__);

  // Await MongoDB persistence
  await saveMongoUser(cleanUserData);
};

export const updateUserBalance = async (
  username: string,
  operation: "add" | "deduct" | "set",
  asset: "realBalance" | "usdtBalance" | "btcBalance" | "demoBalance" | "stakedBalance" | "miningEarnings",
  amount: number,
  note?: string,
  skipSubmissionLog?: boolean
) => {
  const users = await getAdminUsers();
  const user = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  const isMaster = user.username.toLowerCase() === "jjj";
  const currentVal =
    typeof user[asset] === "number"
      ? user[asset]
      : asset === "realBalance" || asset === "usdtBalance"
      ? isMaster
        ? 100000
        : 0
      : 0;

  let newVal = currentVal;
  if (operation === "add") {
    newVal = currentVal + amount;
  } else if (operation === "deduct") {
    newVal = Math.max(0, currentVal - amount);
  } else if (operation === "set") {
    newVal = Math.max(0, amount);
  }

  user[asset] = newVal;
  if (asset === "realBalance") user.usdtBalance = newVal;
  if (asset === "usdtBalance") user.realBalance = newVal;

  await saveSingleUser(user);

  if (operation === "add" && !skipSubmissionLog) {
    try {
      const isBtc = asset === "btcBalance";
      const isDemo = asset === "demoBalance";
      const isStaked = asset === "stakedBalance";
      const assetSymbol = isBtc ? "BTC" : isDemo ? "USD (Demo)" : isStaked ? "USDT (Staking)" : "USDT";
      const usdTotal = isBtc ? (amount * 63000).toFixed(2) : amount.toFixed(2);
      const refCode = "ADM" + Math.floor(100000 + Math.random() * 900000);

      await addSubmission({
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
    ipAddress: "Apex Production Gateway",
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
  }).catch(() => {});

  return user;
};

export const deleteAdminUser = async (username: string): Promise<boolean> => {
  const cleanUsername = String(username || "").toLowerCase();
  const users = await getAdminUsers();
  const filtered = users.filter((u: any) => u.username?.toLowerCase() !== cleanUsername);
  globalThis.__users_cache__ = filtered;
  writeDiskUsers(filtered);
  return await deleteMongoUser(username);
};

export const updateAdminUser = async (username: string, updates: Record<string, any>) => {
  const users = await getAdminUsers();
  const user = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());
  if (!user) return null;

  Object.assign(user, updates);
  await saveSingleUser(user);
  return user;
};

// -------------------------------------------------------------
// CHATS REPOSITORY (MongoDB Atlas)
// -------------------------------------------------------------
export const getChatsAsync = async (): Promise<SupportChat[]> => {
  try {
    const mongoChats = await getMongoChats();
    if (mongoChats && mongoChats.length > 0) {
      globalThis.__chats_cache__ = mongoChats;
      return mongoChats;
    }
  } catch (err) {
    console.error("MongoDB getChats error:", err);
  }
  return globalThis.__chats_cache__ || [];
};

export const saveChatsAsync = async (chats: SupportChat[]) => {
  globalThis.__chats_cache__ = chats;
  saveAllMongoChats(chats).catch((err) => console.error("MongoDB saveChats error:", err));
};

export const saveSingleChatAsync = async (chat: SupportChat) => {
  if (!globalThis.__chats_cache__) globalThis.__chats_cache__ = [];
  const idx = globalThis.__chats_cache__.findIndex((c) => c.id === chat.id);
  if (idx > -1) {
    globalThis.__chats_cache__[idx] = chat;
  } else {
    globalThis.__chats_cache__.push(chat);
  }
  saveMongoChat(chat).catch((err) => console.error("MongoDB saveSingleChat error:", err));
};

export const getChats = (): SupportChat[] => {
  return globalThis.__chats_cache__ || [];
};

export const saveChats = (chats: SupportChat[]) => {
  saveChatsAsync(chats);
};

// -------------------------------------------------------------
// SUBMISSIONS REPOSITORY (MongoDB Atlas)
// -------------------------------------------------------------
export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const mongoSubs = await getMongoSubmissions();
    if (mongoSubs && mongoSubs.length > 0) {
      globalThis.__submissions_cache__ = mongoSubs;
      return mongoSubs;
    }
  } catch (err) {
    console.error("Error reading submissions from MongoDB:", err);
  }
  return globalThis.__submissions_cache__ || [];
};

export const addSubmission = async (submission: Omit<Submission, "id" | "createdAt">): Promise<Submission> => {
  const newSubmission: Submission = {
    ...submission,
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };

  if (!globalThis.__submissions_cache__) globalThis.__submissions_cache__ = [];
  globalThis.__submissions_cache__.unshift(newSubmission);

  await saveMongoSubmission(newSubmission);
  return newSubmission;
};

export const saveSubmissions = async (submissions: Submission[]) => {
  globalThis.__submissions_cache__ = submissions;
  for (const sub of submissions) {
    saveMongoSubmission(sub).catch(() => {});
  }
};

export const updateSubmissionStatus = async (
  id: string,
  status: "Approved" | "Pending" | "Cancelled",
  note?: string
): Promise<Submission | null> => {
  const submissions = await getSubmissions();
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
  await saveMongoSubmission(submissions[index]);
  globalThis.__submissions_cache__ = submissions;
  return submissions[index];
};

export const deleteSubmission = async (id: string): Promise<boolean> => {
  const submissions = await getSubmissions();
  const filtered = submissions.filter((s) => s.id !== id);
  globalThis.__submissions_cache__ = filtered;
  return await deleteMongoSubmission(id);
};

export const updateSubmission = async (id: string, updates: Partial<Submission>): Promise<Submission | null> => {
  const submissions = await getSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  submissions[index] = {
    ...submissions[index],
    ...updates,
    details: {
      ...(submissions[index].details || {}),
      ...(updates.details || {}),
      updatedAt: new Date().toISOString(),
    },
  };
  await saveMongoSubmission(submissions[index]);
  globalThis.__submissions_cache__ = submissions;
  return submissions[index];
};
