import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminUsers, addServerLog, parseJsonBody } from "@/utils/serverDb";
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

const saveRegularUsers = (users: any[]) => {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving users:", err);
  }
};

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const { username, password, email } = body;

    if (!username || !password || !email) {
      return NextResponse.json(
        { error: "Username, password, and email are required." },
        { status: 400 }
      );
    }

    if (username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const admins = getAdminUsers();
    const users = getRegularUsers();

    // Check for duplicate username in both admin and user databases
    const existingUsername = admins.find(
      (a: any) => a.username.toLowerCase() === username.trim().toLowerCase()
    ) || users.find(
      (u: any) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existingUsername) {
      return NextResponse.json(
        { error: "That username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Check for duplicate email in both databases
    const existingEmail = admins.find(
      (a: any) => a.email.toLowerCase() === email.trim().toLowerCase()
    ) || users.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    // Generate avatar initials from username
    const nameParts = username.trim().split(/\s+/);
    const avatar =
      nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : username.trim().substring(0, 2).toUpperCase();

    const newUser = {
      username: username.trim().toLowerCase(),
      password: password,
      role: "User",
      email: email.trim().toLowerCase(),
      avatar,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveRegularUsers(users);

    // Auto-login the newly registered user
    const sessionData = JSON.stringify({
      username: newUser.username,
      role: newUser.role,
      email: newUser.email,
      avatar: newUser.avatar
    });

    cookies().set("brokerage_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/"
    });

    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    addServerLog({
      userId: `usr-${newUser.username}`,
      userName: newUser.username,
      userEmail: newUser.email,
      userRole: newUser.role,
      avatar: newUser.avatar,
      action: `New user account created: ${newUser.username}`,
      category: "security",
      status: "success",
      severity: "info",
      ipAddress,
      location: "Unknown",
      browser: userAgent,
      details: { role: newUser.role, email: newUser.email }
    });

    return NextResponse.json({
      success: true,
      user: {
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    console.error("Error in register route:", err);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}


