import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getChats,
  saveChats,
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
      isAdmin: session.role === "Administrator",
      username: session.username || "",
      role: session.role || "User",
      email: session.email || "",
    };
  } catch (error) {
    console.error("Failed to parse brokerage session:", error);

    return {
      isAdmin: false,
      username: "",
      role: "",
      email: "",
    };
  }
}

function createUserChat(username: string): SupportChat {
  const colors = [
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
  ];

  const randomColor =
    colors[Math.floor(Math.random() * colors.length)];

  const cleanName = username.trim() || "Guest";

  return {
    id: `chat_${cleanName.toLowerCase().replace(/\s+/g, "_")}`,
    name: cleanName,
    username: cleanName,
    avatar: cleanName.substring(0, 2).toUpperCase(),
    color: randomColor,
    status: "Online",
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: "Admin",
        text: `Hello ${cleanName}, how can I help you today?`,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeUsername = searchParams.get("username");
    const fetchAll = searchParams.get("all") === "true";

    const {
      isAdmin,
      username: loggedInUsername,
    } = await getSession();

    const chats = getChats();

    // If requested with all=true or by Admin panel requesting list
    if (fetchAll || (isAdmin && !activeUsername && !searchParams.get("self"))) {
      return NextResponse.json({
        success: true,
        isAdmin: true,
        chats,
      });
    }

    const targetUsername = activeUsername || loggedInUsername || "Guest";

    let userChat = chats.find(
      (chat) =>
        chat.username.toLowerCase() === targetUsername.toLowerCase() ||
        chat.id === `chat_${targetUsername.toLowerCase().replace(/\s+/g, "_")}`
    );

    if (!userChat) {
      userChat = createUserChat(targetUsername);
      chats.push(userChat);
      saveChats(chats);
    } else {
      userChat.status = "Online";
      saveChats(chats);
    }

    return NextResponse.json({
      success: true,
      isAdmin,
      chat: userChat,
      chats: isAdmin ? chats : undefined,
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
    const body = await request.json();

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

    const chats = getChats();
    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    /*
     * ADMIN MESSAGE
     */
    if (senderType === "admin") {
      if (!isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Unauthorized. Admin rights required.",
          },
          { status: 403 }
        );
      }

      if (!chatId) {
        return NextResponse.json(
          {
            success: false,
            error: "chatId is required.",
          },
          { status: 400 }
        );
      }

      const targetChat = chats.find(
        (chat) => chat.id === chatId || chat.username.toLowerCase() === chatId.toLowerCase()
      );

      if (!targetChat) {
        return NextResponse.json(
          {
            success: false,
            error: "Target chat session not found.",
          },
          { status: 404 }
        );
      }

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sender: "Admin",
        text: text.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderType: "admin",
      };

      targetChat.messages.push(newMessage);
      targetChat.lastUpdated = new Date().toISOString();
      targetChat.status = "Online";

      saveChats(chats);

      // Log admin support reply to server activity logs
      addServerLog({
        userId: `usr-${loggedInUsername || "admin"}`,
        userName: loggedInUsername || "Administrator",
        userEmail: loggedInEmail || "admin@brokerage.internal",
        userRole: "Administrator",
        avatar: "AD",
        action: `Admin support reply sent to ${targetChat.name}: "${text.trim().slice(0, 50)}${text.trim().length > 50 ? '...' : ''}"`,
        category: "chat",
        status: "success",
        severity: "info",
        ipAddress,
        location: "System Admin Terminal",
        browser: userAgent,
        details: {
          recipientChatId: targetChat.id,
          recipientUser: targetChat.username,
          messageId: newMessage.id,
          text: newMessage.text,
        },
      });

      return NextResponse.json({
        success: true,
        message: newMessage,
        chat: targetChat,
      });
    }

    /*
     * USER MESSAGE
     */
    const targetUsername = loggedInUsername || bodyUsername || sender || "Guest";

    let userChat = chats.find(
      (chat) =>
        chat.username.toLowerCase() === targetUsername.toLowerCase() ||
        chat.id === (chatId || `chat_${targetUsername.toLowerCase().replace(/\s+/g, "_")}`)
    );

    /*
     * If the user doesn't have a chat yet, create it.
     */
    if (!userChat) {
      userChat = createUserChat(targetUsername);
      chats.push(userChat);
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: targetUsername,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      senderType: "user",
    };

    userChat.messages.push(newMessage);
    userChat.lastUpdated = new Date().toISOString();
    userChat.status = "Online";

    saveChats(chats);

    // Log user chat message to server activity logs
    addServerLog({
      userId: `usr-${targetUsername}`,
      userName: targetUsername,
      userEmail: loggedInEmail || `${targetUsername}@user.net`,
      userRole: loggedInRole || "User",
      avatar: userChat.avatar,
      action: `Live chat message from ${targetUsername}: "${text.trim().slice(0, 50)}${text.trim().length > 50 ? '...' : ''}"`,
      category: "chat",
      status: "success",
      severity: "info",
      ipAddress,
      location: "Live Support Lounge",
      browser: userAgent,
      details: {
        chatId: userChat.id,
        user: targetUsername,
        messageId: newMessage.id,
        text: newMessage.text,
      },
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
      chat: userChat,
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}