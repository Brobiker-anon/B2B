import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerLogs, addServerLog, clearServerLogs, parseJsonBody } from "@/utils/serverDb";

// GET: Fetch all logs (requires active administrative authentication session)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("brokerage_session");
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "Clearance Denied. Session unauthenticated." },
        { status: 401 }
      );
    }

    let session: any;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    if (session?.role !== "Administrator") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const logs = getServerLogs();
    return NextResponse.json({ success: true, logs });

  } catch (err) {
    console.error("Error in GET logs route:", err);
    return NextResponse.json(
      { error: "Internal server read error" },
      { status: 500 }
    );
  }
}

// POST: Add a new log entry (open to client navigation and simulation logs posting)
export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    
    const { 
      userId, userName, userEmail, userRole, avatar, 
      action, category, status, severity, 
      ipAddress, location, browser, details 
    } = body;

    if (!action || !category || !status || !severity) {
      return NextResponse.json(
        { error: "Missing required activity log parameters" },
        { status: 400 }
      );
    }

    // Default missing parameters gracefully
    const userAgent = browser || request.headers.get("user-agent") || "Unknown Browser";
    const ip = ipAddress || request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const savedLog = addServerLog({
      userId: userId || "usr-guest",
      userName: userName || "Visitor Session",
      userEmail: userEmail || "visitor@brokerage-platform.com",
      userRole: userRole || "Guest User",
      avatar: avatar || "VS",
      action,
      category,
      status,
      severity,
      ipAddress: ip,
      location: location || "Local Router Gateway",
      browser: userAgent,
      details: details || {}
    });

    return NextResponse.json({ success: true, log: savedLog });

  } catch (err) {
    console.error("Error in POST logs route:", err);
    return NextResponse.json(
      { error: "Internal server append error" },
      { status: 500 }
    );
  }
}

// DELETE: Clears the logs file database (requires session verification)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("brokerage_session");
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "Clearance Denied. Session unauthenticated." },
        { status: 401 }
      );
    }

    let session: any;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    if (session?.role !== "Administrator") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    clearServerLogs();
    
    // Log the purge event on the server
    try {
      const admin = JSON.parse(sessionCookie.value);
      addServerLog({
        userId: "usr-admin-session",
        userName: admin.username === "admin" ? "Alex Rivera" : admin.username,
        userEmail: admin.email,
        userRole: admin.role,
        avatar: admin.avatar,
        action: "Administrator executed central activity audit logs database purge",
        category: "security",
        status: "success",
        severity: "critical",
        ipAddress: "127.0.0.1",
        location: "System Console Console",
        browser: "Console Process",
        details: { action: "purge_logs_database" }
      });
    } catch (e) {}

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Error in DELETE logs route:", err);
    return NextResponse.json(
      { error: "Internal server delete error" },
      { status: 500 }
    );
  }
}


