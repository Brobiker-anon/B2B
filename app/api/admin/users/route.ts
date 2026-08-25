import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminUsers, getSubmissions } from "@/utils/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("brokerage_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to access this resource." },
        { status: 401 }
      );
    }

    let session: any;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
    }

    if (!session?.username) {
      return NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    }

    if (session.role !== "Administrator") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const users = getAdminUsers();
    const submissions = getSubmissions();

    return NextResponse.json({
      success: true,
      requestedBy: session.username,
      users: users.map((u: any) => ({
        username: u.username,
        password: u.password,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        country: u.country || "",
        phone: u.phone || "",
        currency: u.currency || "",
        referralCode: u.referralCode || "",
        createdAt: u.createdAt,
      })),
      submissions,
    });
  } catch (err) {
    console.error("Error in admin/users route:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
