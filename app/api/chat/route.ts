import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getChats,
  saveChats,
  ChatMessage,
  SupportChat,
} from "@/utils/serverDb";

export const dynamic = "force-dynamic";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("brokerage_session");

  if (!sessionCookie?.value) {
    return {
      isAdmin: false,
      username: "",
    };
  }

  try {
    const session = JSON.parse(sessionCookie.value);

    return {
      isAdmin: session.role === "Administrator",
      username: session.username || "",
    };
  } catch (error) {
    console.error("Failed to parse brokerage session:", error);

    return {
      isAdmin: false,
      username: "",
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

  return {
    id: `chat_${username.toLowerCase()}`,
    name: username,
    username,
    avatar: username.substring(0, 2).toUpperCase(),
    color: randomColor,
    status: "Online",
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: "Admin",
        text: `Hello ${username}, how can I help you today?`,
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

    const {
      isAdmin,
      username: loggedInUsername,
    } = await getSession();

    const chats = getChats();

    if (isAdmin) {
      return NextResponse.json({
        success: true,
        isAdmin: true,
        chats,
      });
    }

    const targetUsername =
      loggedInUsername || activeUsername || "Guest";

    let userChat = chats.find(
      (chat) =>
        chat.username.toLowerCase() ===
        targetUsername.toLowerCase()
    );

    if (!userChat) {
      userChat = createUserChat(targetUsername);
      chats.push(userChat);
    } else {
      userChat.status = "Online";
    }

    saveChats(chats);

    return NextResponse.json({
      success: true,
      isAdmin: false,
      chat: userChat,
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
    } = await getSession();

    const chats = getChats();

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
        (chat) => chat.id === chatId
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
        id: `msg-${Date.now()}`,
        sender:
          loggedInUsername || "System Admin",
        text: text.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderType: "admin",
      };

      targetChat.messages.push(newMessage);

      targetChat.lastUpdated =
        new Date().toISOString();

      targetChat.status = "Online";

      saveChats(chats);

      return NextResponse.json({
        success: true,
        message: newMessage,
        chat: targetChat,
      });
    }

    /*
     * USER MESSAGE
     */

    const targetUsername =
      loggedInUsername ||
      sender ||
      "Guest";

    let userChat = chats.find(
      (chat) =>
        chat.username.toLowerCase() ===
        targetUsername.toLowerCase()
    );

    /*
     * IMPORTANT:
     * If the user doesn't have a chat yet,
     * create it instead of returning 404.
     */
    if (!userChat) {
      userChat = createUserChat(targetUsername);
      chats.push(userChat);
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: targetUsername,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      senderType: "user",
    };

    userChat.messages.push(newMessage);

    userChat.lastUpdated =
      new Date().toISOString();

    userChat.status = "Online";

    saveChats(chats);

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