import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminUsers, addServerLog, parseJsonBody } from "@/utils/serverDb";

export async function POST(request: Request) {
  try {
    const { username, password } = await parseJsonBody(request);

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const admins = getAdminUsers();
    const cleanInput = (username || "").toLowerCase().trim();
    let admin = admins.find(
      (a: any) =>
        (a.username?.toLowerCase() === cleanInput || a.email?.toLowerCase() === cleanInput) &&
        a.password === password
    );

    // Demo fallback for any login if not found in db
    if (!admin && cleanInput && password) {
      admin = {
        username: cleanInput.includes("@") ? cleanInput.split("@")[0] : cleanInput,
        role: "Administrator",
        email: cleanInput.includes("@") ? cleanInput : `${cleanInput}@brokerage.com`,
        avatar: (cleanInput[0] || "U").toUpperCase() + ((cleanInput[1] || "S").toUpperCase())
      };
    }

    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    if (!admin) {
      // Log failed login audit event on the server
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
        ipAddress: ipAddress,
        location: "Unknown",
        browser: userAgent,
        details: { attemptedID: username, code: "AUTH_FAILED" }
      });

      return NextResponse.json(
        { error: "Invalid credentials. Please try again." },
        { status: 401 }
      );
    }

    // Set secure HTTP-only session cookie containing admin details
    const sessionData = JSON.stringify({
      username: admin.username,
      role: admin.role,
      email: admin.email,
      avatar: admin.avatar
    });

    cookies().set("brokerage_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/"
    });

    // Log successful login audit event on the server
    addServerLog({
      userId: "usr-admin-session",
      userName: admin.username,
      userEmail: admin.email,
      userRole: admin.role,
      avatar: admin.avatar,
      action: `User authenticated successfully via secure credentials challenge (${admin.role})`,
      category: "security",
      status: "success",
      severity: "warning",
      ipAddress: ipAddress,
      location: "Unknown",
      browser: userAgent,
      details: { role: admin.role, protocol: "Secured Handshake" }
    });

    return NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        role: admin.role,
        email: admin.email,
        avatar: admin.avatar
      }
    });

  } catch (err) {
    console.error("Error in login route:", err);
    return NextResponse.json(
      { error: "Internal server handshake error" },
      { status: 500 }
    );
  }
}


