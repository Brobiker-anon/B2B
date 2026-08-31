import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAdminUsers,
  addServerLog,
  parseJsonBody,
} from "@/utils/serverDb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, password } = await parseJsonBody(request);

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required",
        },
        { status: 400 }
      );
    }

    const users = await getAdminUsers();

    const cleanInput = String(username)
      .toLowerCase()
      .trim();

    const user = users.find(
      (u: any) =>
        (
          u.username?.toLowerCase() === cleanInput ||
          u.email?.toLowerCase() === cleanInput
        ) &&
        u.password === password
    );

    const userAgent =
      request.headers.get("user-agent") ||
      "Unknown Browser";

    const ipAddress =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      request.headers.get("x-real-ip") ||
      "Production Client IP";

    if (!user) {
      addServerLog({
        userId: "usr-anonymous",
        userName: "Anonymous",
        userEmail: "unknown@security-gateway.net",
        userRole: "Unauthenticated Guest",
        avatar: "??",
        action: `Failed login challenge (Attempted ID: ${username})`,
        category: "security",
        status: "failed",
        severity: "warning",
        ipAddress,
        location: "Apex Gateway",
        browser: userAgent,
        details: {
          attemptedID: username,
          code: "AUTH_FAILED",
        },
      }).catch(() => {});

      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials. Please try again.",
        },
        { status: 401 }
      );
    }

    const sessionData = JSON.stringify({
      username: user.username,
      role: user.role,
      email: user.email,
      avatar: user.avatar,
    });

    const cookieStore = await cookies();

    cookieStore.set(
      "brokerage_session",
      sessionData,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 Year persistent login
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        path: "/",
      }
    );

    addServerLog({
      userId: `usr-${user.username}`,
      userName: user.username,
      userEmail: user.email,
      userRole: user.role,
      avatar: user.avatar,
      action: `User authenticated successfully (${user.role})`,
      category: "security",
      status: "success",
      severity: "info",
      ipAddress,
      location: "Apex Production Gateway",
      browser: userAgent,
      details: {
        role: user.role,
        protocol: "Secured Handshake",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error in login route:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server handshake error",
      },
      { status: 500 }
    );
  }
}