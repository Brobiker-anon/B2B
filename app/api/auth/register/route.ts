import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminUsers, saveAdminUsers, addServerLog, parseJsonBody } from "@/utils/serverDb";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const { username, password, email, role } = body;

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

    const admins = getAdminUsers(); // used as general users database

    // Check for duplicate username
    const existingUsername = admins.find(
      (a: any) => a.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existingUsername) {
      return NextResponse.json(
        { error: "That username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const existingEmail = admins.find(
      (a: any) => a.email.toLowerCase() === email.trim().toLowerCase()
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

    const assignedRole = "Administrator";

    const newAdmin = {
      username: username.trim().toLowerCase(),
      password: password,
      role: assignedRole,
      email: email.trim().toLowerCase(),
      avatar,
      createdAt: new Date().toISOString()
    };

    admins.push(newAdmin);
    saveAdminUsers(admins);

    // Auto-login the newly registered user
    const sessionData = JSON.stringify({
      username: newAdmin.username,
      role: newAdmin.role,
      email: newAdmin.email,
      avatar: newAdmin.avatar
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
      userId: `usr-${newAdmin.username}`,
      userName: newAdmin.username,
      userEmail: newAdmin.email,
      userRole: newAdmin.role,
      avatar: newAdmin.avatar,
      action: `New account created and authenticated: ${newAdmin.username} (${newAdmin.role})`,
      category: "security",
      status: "success",
      severity: "warning",
      ipAddress,
      location: "Unknown",
      browser: userAgent,
      details: { role: newAdmin.role, email: newAdmin.email }
    });

    return NextResponse.json({
      success: true,
      user: {
        username: newAdmin.username,
        role: newAdmin.role,
        email: newAdmin.email,
        avatar: newAdmin.avatar
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


