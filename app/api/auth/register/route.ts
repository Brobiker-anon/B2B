import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminUsers, addServerLog, parseJsonBody, saveSingleUser } from "@/utils/serverDb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    const {
      username,
      password,
      email,
      role,
      country,
      phone,
      currency,
      referralCode,
      firstName,
      lastName,
    } = body;

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

    const users = await getAdminUsers();

    // Check for duplicate username
    const existingUsername = users.find(
      (a: any) => a.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existingUsername) {
      return NextResponse.json(
        { error: "That username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const existingEmail = users.find(
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

    const assignedRole =
      role === "Administrator" ? "Administrator" : "User";

    const newUser = {
      username: username.trim().toLowerCase(),
      password: password,
      role: assignedRole,
      email: email.trim().toLowerCase(),
      avatar,
      firstName: firstName?.trim() || nameParts[0] || "",
      lastName: lastName?.trim() || nameParts.slice(1).join(" ") || "",
      country: country || "",
      phone: phone || "",
      currency: currency || "",
      referralCode: referralCode || "",
      createdAt: new Date().toISOString()
    };

    await saveSingleUser(newUser);

    // Auto-login the newly registered user
    const sessionData = JSON.stringify({
      username: newUser.username,
      role: newUser.role,
      email: newUser.email,
      avatar: newUser.avatar
    });

    const cookieStore = await cookies();
    cookieStore.set("brokerage_session", sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 Year persistent login
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      path: "/"
    });

    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "Production Client IP";

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
      location: "Apex Registration Gateway",
      browser: userAgent,
      details: {
        role: newUser.role,
        email: newUser.email,
        country: newUser.country,
        phone: newUser.phone,
        currency: newUser.currency,
        referralCode: newUser.referralCode,
      }
    }).catch(() => {});

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
