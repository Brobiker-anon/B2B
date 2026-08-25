import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAdminUsers,
  addServerLog,
  parseJsonBody,
} from "@/utils/serverDb";
import fs from "fs";
import path from "path";

const USERS_FILE_PATH = path.join(process.cwd(), "data", "users.json");

const getRegularUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users:", err);
    return [];
  }
};

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

    const admins = getAdminUsers();
    const users = getRegularUsers();

    const cleanInput = String(username)
      .toLowerCase()
      .trim();

    let user = admins.find(
      (a: any) =>
        (
          a.username?.toLowerCase() === cleanInput ||
          a.email?.toLowerCase() === cleanInput
        ) &&
        a.password === password
    ) || users.find(
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
      "127.0.0.1";

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
        location: "Unknown",
        browser: userAgent,
        details: {
          attemptedID: username,
          code: "AUTH_FAILED",
        },
      });

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
        sameSite: "strict",
        maxAge: 60 * 60 * 2,
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
      location: "Unknown",
      browser: userAgent,
      details: {
        role: user.role,
        protocol: "Secured Handshake",
      },
    });

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