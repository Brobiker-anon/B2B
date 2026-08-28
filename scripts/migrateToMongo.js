const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://davidadeniyi269:AbsJi834%5EeKGYU%40@cluster0.zwijmfw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("apexveltrix");
  console.log("Connected successfully!");

  // Chats
  const chatsPath = path.join(process.cwd(), "data", "chats.json");
  if (fs.existsSync(chatsPath)) {
    const chats = JSON.parse(fs.readFileSync(chatsPath, "utf8"));
    for (const chat of chats) {
      await db.collection("chats").updateOne(
        { id: chat.id },
        { $set: chat },
        { upsert: true }
      );
    }
    console.log(`Seeded ${chats.length} chats.`);
  }

  // Users
  const usersPath = path.join(process.cwd(), "data", "users.json");
  if (fs.existsSync(usersPath)) {
    const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    for (const user of users) {
      await db.collection("users").updateOne(
        { username: user.username },
        { $set: user },
        { upsert: true }
      );
    }
    console.log(`Seeded ${users.length} users.`);
  }

  // Submissions
  const subPath = path.join(process.cwd(), "data", "submissions.json");
  if (fs.existsSync(subPath)) {
    const subs = JSON.parse(fs.readFileSync(subPath, "utf8"));
    for (const sub of subs) {
      await db.collection("submissions").updateOne(
        { id: sub.id },
        { $set: sub },
        { upsert: true }
      );
    }
    console.log(`Seeded ${subs.length} submissions.`);
  }

  await client.close();
  console.log("🎉 ALL DATA MIGRATED TO MONGODB ATLAS SUCCESSFULLY!");
}

seed().catch(console.error);
