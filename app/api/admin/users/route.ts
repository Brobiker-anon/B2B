import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminUsers } from "@/utils/serverDb";
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

// Protected endpoint — only accessible when a valid session cookie exists
export async function GET() {
  try {
    const sessionCookie = cookies().get("brokerage_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to access this resource." },
        { status: 401 }
      );
    }

    // Validate session is parseable
    let session: any;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: "Invalid session token." },
        { status: 401 }
      );
    }

    if (!session?.username) {
      return NextResponse.json(
        { error: "Session expired or invalid." },
        { status: 401 }
      );
    }

    if (session.role !== "Administrator") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    // Return both admin and regular user records including passwords (admin-only view)
    const admins = getAdminUsers();
    const users = getRegularUsers();

    const allUsers = [
      ...admins.map((u: any) => ({ ...u, accountType: "Admin" })),
      ...users.map((u: any) => ({ ...u, accountType: "User" }))
    ];

    return NextResponse.json({
      success: true,
      requestedBy: session.username,
      users: allUsers.map((u: any) => ({
        username: u.username,
        password: u.password,
        email: u.email,
        role: u.role,
        accountType: u.accountType,
        avatar: u.avatar,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error in admin/users route:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
