import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addServerLog } from "@/utils/serverDb";

export async function POST(request: Request) {
  try {
    const sessionCookie = cookies().get("brokerage_session");
    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    if (sessionCookie && sessionCookie.value) {
      try {
        const admin = JSON.parse(sessionCookie.value);
        
        // Log successful logout event in the server database
        addServerLog({
          userId: "usr-admin-session",
          userName: admin.username === "admin" ? "Alex Rivera" : admin.username,
          userEmail: admin.email,
          userRole: admin.role,
          avatar: admin.avatar,
          action: "Administrator voluntarily de-authorized and locked central activity console",
          category: "security",
          status: "success",
          severity: "info",
          ipAddress: ipAddress,
          location: "San Francisco, USA",
          browser: userAgent,
          details: { action: "voluntarily_lock" }
        });
      } catch (e) {
        console.error("Error parsing admin details on logout:", e);
      }
    }

    // Delete session cookie
    cookies().delete("brokerage_session");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Error in logout route:", err);
    return NextResponse.json(
      { error: "Internal server logout error" },
      { status: 500 }
    );
  }
}
