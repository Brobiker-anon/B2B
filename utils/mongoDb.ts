import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Ensure resilient DNS resolution for SRV records on serverless and local environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://davidadeniyi269:AbsJi834%5EeKGYU%40@cluster0.zwijmfw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI);
      globalThis._mongoClientPromise = client.connect();
    }
    return globalThis._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(MONGODB_URI);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getMongoDb(): Promise<Db> {
  const connectedClient = await getMongoClient();
  return connectedClient.db("apexveltrix");
}

// -------------------------------------------------------------
// CHATS REPOSITORY (MongoDB)
// -------------------------------------------------------------
export async function getMongoChats(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const chats = await db.collection("chats").find({}).toArray();
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
    await db.collection("chats").updateOne(
      { id: chat.id },
      { $set: chat },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error saving chat to MongoDB:", err);
  }
}

export async function saveAllMongoChats(chats: any[]): Promise<void> {
  try {
    const db = await getMongoDb();
    for (const chat of chats) {
      await db.collection("chats").updateOne(
        { id: chat.id },
        { $set: chat },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("Error batch saving chats to MongoDB:", err);
  }
}

// -------------------------------------------------------------
// USERS REPOSITORY (MongoDB)
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

export async function saveMongoUser(user: any): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection("users").updateOne(
      { username: user.username },
      { $set: user },
      { upsert: true }
    );
  } catch (err) {
    console.error("Error saving user to MongoDB:", err);
  }
}

export async function saveAllMongoUsers(users: any[]): Promise<void> {
  try {
    const db = await getMongoDb();
    for (const user of users) {
      await db.collection("users").updateOne(
        { username: user.username },
        { $set: user },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("Error saving users batch to MongoDB:", err);
  }
}

// -------------------------------------------------------------
// SUBMISSIONS REPOSITORY (MongoDB)
// -------------------------------------------------------------
export async function getMongoSubmissions(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const submissions = await db.collection("submissions").find({}).sort({ createdAt: -1 }).toArray();
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
// ACTIVITY LOGS REPOSITORY (MongoDB)
// -------------------------------------------------------------
export async function getMongoLogs(): Promise<any[]> {
  try {
    const db = await getMongoDb();
    const logs = await db.collection("logs").find({}).sort({ timestamp: -1 }).limit(300).toArray();
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
