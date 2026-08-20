import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getChats, saveChats, SupportChat, ChatMessage } from "@/utils/serverDb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeUsername = searchParams.get("username");

    // Check if the user is logged in as Admin
    const sessionCookie = cookies().get("brokerage_session");
    let isAdmin = false;
    let loggedInUsername = "";

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.role === "Administrator") {
          isAdmin = true;
        }
        loggedInUsername = session.username;
      } catch {}
    }

    const chats = getChats();

    // If Admin, return all chat directories
    if (isAdmin) {
      return NextResponse.json({ success: true, isAdmin: true, chats });
    }

    // Otherwise, find or create the user's specific chat
    const targetUsername = loggedInUsername || activeUsername || "Guest";
    let userChat = chats.find(c => c.username.toLowerCase() === targetUsername.toLowerCase());

    if (!userChat) {
      const colors = [
        "from-purple-500 to-indigo-500",
        "from-blue-500 to-cyan-500",
        "from-green-500 to-emerald-500",
        "from-pink-500 to-rose-500",
        "from-amber-500 to-orange-500"
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      userChat = {
        id: `chat_${targetUsername.toLowerCase()}`,
        name: targetUsername,
        username: targetUsername,
        avatar: targetUsername.substring(0, 2).toUpperCase(),
        color: randomColor,
        status: "Online",
        messages: [
          {
            id: `msg-1`,
            sender: "Admin",
            text: `Hello ${targetUsername}, how can I help you today?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderType: "admin"
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      chats.push(userChat);
      saveChats(chats);
    } else {
      // Keep online status active when fetched by user
      userChat.status = "Online";
      saveChats(chats);
    }

    return NextResponse.json({ success: true, isAdmin: false, chat: userChat });
  } catch (err) {
    console.error("GET /api/chat error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, text, sender, senderType } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: "Message text is required." }, { status: 400 });
    }

    // Verify Admin status if senderType is admin
    const sessionCookie = cookies().get("brokerage_session");
    let isAdmin = false;
    let loggedInUsername = "";

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.role === "Administrator") {
          isAdmin = true;
        }
        loggedInUsername = session.username;
      } catch {}
    }

    const chats = getChats();

    // If admin is sending, verify credentials and locate target chat
    if (senderType === "admin") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized. Admin rights required." }, { status: 403 });
      }

      const targetChat = chats.find(c => c.id === chatId);
      if (!targetChat) {
        return NextResponse.json({ error: "Target chat session not found." }, { status: 404 });
      }

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: loggedInUsername || "System Admin",
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderType: "admin"
      };

      targetChat.messages.push(newMsg);
      targetChat.lastUpdated = new Date().toISOString();
      saveChats(chats);

      return NextResponse.json({ success: true, message: newMsg });
    }

    // Otherwise, user is sending to their own chat session
    const targetUsername = loggedInUsername || sender || "Guest";
    let userChat = chats.find(c => c.username.toLowerCase() === targetUsername.toLowerCase());

    if (!userChat) {
      return NextResponse.json({ error: "Chat session not active." }, { status: 404 });
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: targetUsername,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderType: "user"
    };

    userChat.messages.push(newMsg);
    userChat.lastUpdated = new Date().toISOString();
    saveChats(chats);

    return NextResponse.json({ success: true, message: newMsg });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
