import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure resilient DNS resolution for SRV records in production
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://davidadeniyi269:AbsJi834%5EeKGYU%40@cluster0.zwijmfw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined.");
  }

  // Use persistent connection pool across production lambdas and processes
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    globalThis._mongoClientPromise = client.connect().catch((err) => {
      // Reset cached promise so next call can retry connecting
      globalThis._mongoClientPromise = undefined;
      console.error("MongoDB connection failed, clearing cached promise:", err.message);
      throw err;
    });
  }

  return globalThis._mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const connectedClient = await getMongoClient();
  return connectedClient.db("apexveltrix");
}

// -------------------------------------------------------------
// CHATS REPOSITORY (MongoDB Atlas)
// -------------------------------------------------------------
export async function getMongoChats(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const chats = await db
      .collection("chats")
      .find({})
      .sort({ lastUpdated: -1 })
      .toArray();
    return chats.map((c: any) => {
      const { _id, ...rest } = c;
      return rest;
    });
  } catch (err) {
    console.error("Error reading chats from MongoDB:", err);
    return [];
  }
}

export async function saveMongoChat(chat: any): Promise<void> {
  try {
    const db = await getMongoDb();
    const { _id, ...chatData } = chat;
    await db.collection("chats").updateOne(
      { id: chat.id },
      { $set: chatData },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error saving chat to MongoDB:", err);
  }
}

export async function saveAllMongoChats(chats: any[]): Promise<void> {
  try {
    const db = await getMongoDb();
    const bulkOps = chats.map((chat) => {
      const { _id, ...chatData } = chat;
      return {
        updateOne: {
          filter: { id: chat.id },
          update: { $set: chatData },
          upsert: true,
        },
      };
    });
    if (bulkOps.length > 0) {
      await db.collection("chats").bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error("Error batch saving chats to MongoDB:", err);
  }
}

// -------------------------------------------------------------
// USERS REPOSITORY (MongoDB Atlas)
// -------------------------------------------------------------
export async function getMongoUsers(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const users = await db.collection("users").find({}).toArray();
    return users.map((u: any) => {
      const { _id, ...rest } = u;
      return rest;
    });
  } catch (err) {
    console.error("Error reading users from MongoDB:", err);
    return [];
  }
}

export async function getMongoUser(usernameOrEmail: string): Promise<any | null> {
  try {
    const db = await getMongoDb();
    const clean = String(usernameOrEmail || "").trim().toLowerCase();
    if (!clean) return null;
    const cleanEscaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await db.collection("users").findOne({
      $or: [
        { username: clean },
        { email: clean },
        { username: { $regex: new RegExp(`^${cleanEscaped}$`, "i") } },
        { email: { $regex: new RegExp(`^${cleanEscaped}$`, "i") } },
      ],
    });
    if (!user) return null;
    const { _id, ...rest } = user;
    return rest;
  } catch (err) {
    console.error("Error finding user in MongoDB:", err);
    return null;
  }
}

export async function saveMongoUser(user: any): Promise<void> {
  try {
    const db = await getMongoDb();
    const cleanUsername = String(user.username || "").trim().toLowerCase();
    const { _id, ...userData } = user;
    await db.collection("users").updateOne(
      { username: cleanUsername },
      { $set: { ...userData, username: cleanUsername } },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error saving user to MongoDB:", err);
  }
}

export async function saveAllMongoUsers(users: any[]): Promise<void> {
  try {
    const db = await getMongoDb();
    const bulkOps = users.map((user) => {
      const cleanUsername = String(user.username || "").trim().toLowerCase();
      const { _id, ...userData } = user;
      return {
        updateOne: {
          filter: { username: cleanUsername },
          update: { $set: { ...userData, username: cleanUsername } },
          upsert: true,
        },
      };
    });
    if (bulkOps.length > 0) {
      await db.collection("users").bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error("Error saving users batch to MongoDB:", err);
  }
}

export async function deleteMongoUser(username: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    const cleanUsername = String(username || "").trim().toLowerCase();
    const res = await db.collection("users").deleteOne({ username: cleanUsername });
    return res.deletedCount > 0;
  } catch (err) {
    console.error("Error deleting user from MongoDB:", err);
    return false;
  }
}

// -------------------------------------------------------------
// SUBMISSIONS REPOSITORY (MongoDB Atlas)
// -------------------------------------------------------------
export async function getMongoSubmissions(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const submissions = await db
      .collection("submissions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return submissions.map((s: any) => {
      const { _id, ...rest } = s;
      return rest;
    });
  } catch (err) {
    console.error("Error reading submissions from MongoDB:", err);
    return [];
  }
}

export async function saveMongoSubmission(submission: any): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection("submissions").updateOne(
      { id: submission.id },
      { $set: submission },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error saving submission to MongoDB:", err);
  }
}

export async function deleteMongoSubmission(id: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    const res = await db.collection("submissions").deleteOne({ id });
    return res.deletedCount > 0;
  } catch (err) {
    console.error("Error deleting submission from MongoDB:", err);
    return false;
  }
}

// -------------------------------------------------------------
// ACTIVITY LOGS REPOSITORY (MongoDB Atlas)
// -------------------------------------------------------------
export async function getMongoLogs(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const logs = await db
      .collection("logs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    return logs.map((l: any) => {
      const { _id, ...rest } = l;
      return rest;
    });
  } catch (err) {
    console.error("Error reading logs from MongoDB:", err);
    return [];
  }
}

export async function addMongoLog(log: any): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection("logs").insertOne(log);
  } catch (err) {
    console.error("Error writing log to MongoDB:", err);
  }
}

export async function clearMongoLogs(): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection("logs").deleteMany({});
  } catch (err) {
    console.error("Error clearing logs from MongoDB:", err);
  }
}
