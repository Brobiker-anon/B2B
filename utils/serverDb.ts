import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

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

const LOGS_FILE_PATH = path.join(process.cwd(), "data", "logs.json");
const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

// Ensure data folder exists
const ensureDataFolder = () => {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Get all logs from server JSON file
export const getServerLogs = (): ActivityLog[] => {
  ensureDataFolder();
  try {
    if (!fs.existsSync(LOGS_FILE_PATH)) {
      const initialLogs: ActivityLog[] = [];
      fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(initialLogs, null, 2), "utf-8");
      return initialLogs;
    }
    const data = fs.readFileSync(LOGS_FILE_PATH, "utf-8");
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
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2), "utf-8");
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
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(cleared, null, 2), "utf-8");
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
    if (!fs.existsSync(USERS_FILE_PATH)) {
      const defaultAdmins: any[] = [];
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(defaultAdmins, null, 2), "utf-8");
      return defaultAdmins;
    }
    const data = fs.readFileSync(USERS_FILE_PATH, "utf-8");
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
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving admin users:", err);
  }
};

const CHATS_FILE_PATH = path.join(process.cwd(), "data", "chats.json");

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  senderType: "user" | "admin";
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
}

export const getChats = (): SupportChat[] => {
  ensureDataFolder();
  try {
    if (!fs.existsSync(CHATS_FILE_PATH)) {
      const initialChats: SupportChat[] = [];
      fs.writeFileSync(CHATS_FILE_PATH, JSON.stringify(initialChats, null, 2), "utf-8");
      return initialChats;
    }
    const data = fs.readFileSync(CHATS_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading chats file:", err);
    return [];
  }
};

export const saveChats = (chats: SupportChat[]) => {
  ensureDataFolder();
  try {
    fs.writeFileSync(CHATS_FILE_PATH, JSON.stringify(chats, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing chats file:", err);
  }
};

