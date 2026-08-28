import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getChats,
  saveChats,
  getAdminUsers,
  addServerLog,
  ChatMessage,
  SupportChat,
} from "@/utils/serverDb";

export const dynamic = "force-dynamic";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("brokerage_session");

    if (!sessionCookie?.value) {
      return {
        isAdmin: false,
        username: "",
        role: "",
        email: "",
      };
    }

    const session = JSON.parse(sessionCookie.value);

    return {
      isAdmin: session?.role === "Administrator",
      username: session?.username || "",
      role: session?.role || "User",
      email: session?.email || "",
    };
  } catch {
    return {
      isAdmin: false,
      username: "",
      role: "",
      email: "",
    };
  }
}

const cleanLookup = (str: string) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/^chat_/, "")
    .replace(/[\s_-]+/g, "");

function createUserChat(username: string): SupportChat {
  const colors = [
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const cleanName = username.trim() || "Guest";

  return {
    id: `chat_${cleanName.toLowerCase().replace(/[\s_-]+/g, "_")}`,
    name: cleanName,
    username: cleanName,
    avatar: cleanName.substring(0, 2).toUpperCase(),
    color: randomColor,
    status: "Online",
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: "Admin",
        text: `Hello ${cleanName}, welcome to ApexVeltrix support. How can we assist you today?`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderType: "admin",
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

function cleanTyping(chat: SupportChat | undefined | null) {
  if (!chat) return { user: false, admin: false };
  const now = Date.now();
  const userTyping = Boolean(chat.typing?.user && (now - (chat.typing?.userLastTyped || 0)) < 3500);
  const adminTyping = Boolean(chat.typing?.admin && (now - (chat.typing?.adminLastTyped || 0)) < 3500);
  return {
    user: userTyping,
    admin: adminTyping,
  };
}

let lastUsersSync = 0;

function syncUsersWithChats(chats: SupportChat[]): SupportChat[] {
  const now = Date.now();
  if (now - lastUsersSync < 15000 && chats.length > 0) {
    return chats;
  }
  lastUsersSync = now;

  try {
    const registeredUsers = getAdminUsers();
    let updated = false;

    for (const u of registeredUsers) {
      if (!u?.username) continue;
      const exists = chats.find(
        (c) =>
          c.id === `chat_${u.username.toLowerCase().replace(/[\s_-]+/g, "_")}` ||
          cleanLookup(c.username) === cleanLookup(u.username)
      );
      if (!exists) {
        const newChat = createUserChat(u.username);
        if (u.avatar) newChat.avatar = u.avatar;
        chats.push(newChat);
        updated = true;
      }
    }

    if (updated) {
      saveChats(chats);
    }
  } catch (err) {
    console.error("Error syncing users with chats:", err);
  }
  return chats;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeUsername = searchParams.get("username");
    const fetchAll = searchParams.get("all") === "true";

    const {
      isAdmin,
      username: loggedInUsername,
    } = await getSession();

    let rawChats = getChats() || [];
    rawChats = syncUsersWithChats(rawChats);

    const chats = rawChats.map((c) => ({
      ...c,
      messages: Array.isArray(c.messages) ? c.messages : [],
      typing: cleanTyping(c),
    }));

    if (fetchAll) {
      return NextResponse.json({
        success: true,
        isAdmin: true,
        chats,
      });
    }

    const targetUsername = (!isAdmin && loggedInUsername) ? loggedInUsername : (activeUsername || loggedInUsername || "Guest");

    let userChat = rawChats.find(
      (chat) =>
        chat.username?.toLowerCase() === targetUsername.toLowerCase() ||
        chat.id === `chat_${targetUsername.toLowerCase().replace(/[\s_-]+/g, "_")}` ||
        cleanLookup(chat.username) === cleanLookup(targetUsername)
    );

    if (!userChat) {
      userChat = createUserChat(targetUsername);
      rawChats.push(userChat);
      saveChats(rawChats);
    } else {
      userChat.status = "Online";
      if (!Array.isArray(userChat.messages)) {
        userChat.messages = [];
      }
      saveChats(rawChats);
    }

    return NextResponse.json({
      success: true,
      isAdmin,
      chat: {
        ...userChat,
        messages: Array.isArray(userChat.messages) ? userChat.messages : [],
        typing: cleanTyping(userChat),
      },
      chats,
    });
  } catch (error) {
    console.error("GET /api/chat error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    // Handle typing status notification
    if (body.action === "typing") {
      const { chatId, username: bodyUsername, senderType, isTyping } = body;
      const chats = getChats() || [];
      const targetChatId = chatId || (bodyUsername ? `chat_${bodyUsername.toLowerCase().replace(/[\s_-]+/g, "_")}` : null);

      let chat = chats.find(
        (c) =>
          c.id === targetChatId ||
          (bodyUsername && cleanLookup(c.username) === cleanLookup(bodyUsername))
      );

      if (!chat && bodyUsername) {
        chat = createUserChat(bodyUsername);
        chats.push(chat);
      }

      if (chat) {
        const typeKey = senderType === "admin" ? "admin" : "user";
        const timeKey = senderType === "admin" ? "adminLastTyped" : "userLastTyped";
        chat.typing = {
          ...(chat.typing || {}),
          [typeKey]: Boolean(isTyping),
          [timeKey]: isTyping ? Date.now() : 0,
        };
        saveChats(chats);
      }

      return NextResponse.json({
        success: true,
        typing: chat ? cleanTyping(chat) : {},
      });
    }

    const {
      chatId,
      text,
      sender,
      senderType,
      username: bodyUsername,
    } = body;

    if (
      !text ||
      typeof text !== "string" ||
      !text.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Message text is required.",
        },
        { status: 400 }
      );
    }

    const {
      isAdmin,
      username: loggedInUsername,
      email: loggedInEmail,
      role: loggedInRole,
    } = await getSession();

    let chats = getChats() || [];
    chats = syncUsersWithChats(chats);

    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const formattedTime = body.clientTime || new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    /*
     * ADMIN MESSAGE
     */
    if (senderType === "admin") {
      if (!chatId) {
        return NextResponse.json(
          {
            success: false,
            error: "chatId is required.",
          },
          { status: 400 }
        );
      }

      let targetChat = chats.find(
        (chat) =>
          chat.id === chatId ||
          chat.username?.toLowerCase() === chatId.toLowerCase() ||
          cleanLookup(chat.username) === cleanLookup(chatId)
      );

      if (!targetChat) {
        const fallbackName = chatId.replace(/^chat_/, "").replace(/_/g, " ");
        targetChat = createUserChat(fallbackName);
        chats.push(targetChat);
      }

      if (!Array.isArray(targetChat.messages)) {
        targetChat.messages = [];
      }

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender: "Admin",
        text: text.trim(),
        time: formattedTime,
        senderType: "admin",
      };

      targetChat.messages.push(newMessage);
      targetChat.lastUpdated = new Date().toISOString();
      targetChat.status = "Online";
      targetChat.typing = {
        ...(targetChat.typing || {}),
        admin: false,
        adminLastTyped: 0,
      };

      saveChats(chats);

      // Safe activity log
      try {
        addServerLog({
          userId: `usr-${loggedInUsername || "admin"}`,
          userName: loggedInUsername || "Administrator",
          userEmail: loggedInEmail || "admin@apexveltrix.com",
          userRole: "Administrator",
          avatar: "AD",
          action: `Admin support reply sent to ${targetChat.name || targetChat.username || "Client"}: "${text.trim().slice(0, 50)}${text.trim().length > 50 ? '...' : ''}"`,
          category: "chat",
          status: "success",
          severity: "info",
          ipAddress,
          location: "ApexVeltrix Admin Terminal",
          browser: userAgent,
          details: {
            recipientChatId: targetChat.id,
            recipientUser: targetChat.username,
            messageId: newMessage.id,
            text: newMessage.text,
          },
        });
      } catch (logErr) {
        console.error("Non-fatal chat log error:", logErr);
      }

      return NextResponse.json({
        success: true,
        message: newMessage,
        chat: {
          ...targetChat,
          messages: Array.isArray(targetChat.messages) ? targetChat.messages : [],
          typing: cleanTyping(targetChat),
        },
      });
    }

    /*
     * USER MESSAGE
     */
    const targetUsername = (!isAdmin && loggedInUsername)
      ? loggedInUsername
      : (bodyUsername || sender || loggedInUsername || "Guest");

    let userChat = chats.find(
      (chat) =>
        chat.username?.toLowerCase() === targetUsername.toLowerCase() ||
        chat.id === (chatId || `chat_${targetUsername.toLowerCase().replace(/[\s_-]+/g, "_")}`) ||
        cleanLookup(chat.username) === cleanLookup(targetUsername)
    );

    if (!userChat) {
      userChat = createUserChat(targetUsername);
      chats.push(userChat);
    }

    if (!Array.isArray(userChat.messages)) {
      userChat.messages = [];
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: targetUsername,
      text: text.trim(),
      time: formattedTime,
      senderType: "user",
    };

    userChat.messages.push(newMessage);
    userChat.lastUpdated = new Date().toISOString();
    userChat.status = "Online";
    userChat.typing = {
      ...(userChat.typing || {}),
      user: false,
      userLastTyped: 0,
    };

    saveChats(chats);

    // Safe activity log
    try {
      addServerLog({
        userId: `usr-${targetUsername}`,
        userName: targetUsername,
        userEmail: loggedInEmail || `${targetUsername}@user.net`,
        userRole: loggedInRole || "User",
        avatar: userChat.avatar || targetUsername.substring(0, 2).toUpperCase(),
        action: `Live chat message from ${targetUsername}: "${text.trim().slice(0, 50)}${text.trim().length > 50 ? '...' : ''}"`,
        category: "chat",
        status: "success",
        severity: "info",
        ipAddress,
        location: "ApexVeltrix Live Support Lounge",
        browser: userAgent,
        details: {
          chatId: userChat.id,
          user: targetUsername,
          messageId: newMessage.id,
          text: newMessage.text,
        },
      });
    } catch (logErr) {
      console.error("Non-fatal chat log error:", logErr);
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      chat: {
        ...userChat,
        messages: Array.isArray(userChat.messages) ? userChat.messages : [],
        typing: cleanTyping(userChat),
      },
    });
  } catch (error: any) {
    console.error("POST /api/chat error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error.",
      },
      { status: 500 }
    );
  }
}