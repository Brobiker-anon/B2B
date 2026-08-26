import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addSubmission, getSubmissions, updateSubmissionStatus, addServerLog } from "@/utils/serverDb";

export const dynamic = "force-dynamic";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("brokerage_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.username) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (session.role !== "Administrator") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      submissions: getSubmissions(),
    });
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.username) {
      return NextResponse.json({ error: "Please sign in to submit." }, { status: 401 });
    }

    const body = await request.json();
    let { type, reference, method, amountVal, amountAsset, totalUsd, status, details } = body;

    const normalizedType = type === "withdrawal" || type === "withdraw" ? "withdraw" : type === "deposit" ? "deposit" : null;

    if (!normalizedType) {
      return NextResponse.json({ error: "Invalid submission type." }, { status: 400 });
    }

    const submission = addSubmission({
      type: normalizedType,
      username: session.username,
      email: session.email || "",
      reference: reference || `REF-${Date.now()}`,
      method: method || "Unknown",
      amountVal: String(amountVal || "0"),
      amountAsset: amountAsset || "USD",
      totalUsd: totalUsd || "$0.00",
      status: status || "Pending",
      details: details || {},
    });

    addServerLog({
      userId: `usr-${session.username}`,
      userName: session.username,
      userEmail: session.email || "",
      userRole: session.role || "User",
      avatar: session.avatar || "??",
      action: `${normalizedType === "deposit" ? "Deposit" : "Withdrawal"} submitted: ${submission.reference} (${submission.totalUsd})`,
      category: "wallet",
      status: "success",
      severity: "info",
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      location: "Unknown",
      browser: request.headers.get("user-agent") || "Unknown",
      details: submission,
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.username || session.role !== "Administrator") {
      return NextResponse.json({ error: "Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, note } = body;

    if (!id || !status || !["Approved", "Pending", "Cancelled"].includes(status)) {
      return NextResponse.json({ error: "Valid submission ID and status ('Approved' | 'Pending' | 'Cancelled') required." }, { status: 400 });
    }

    const updated = updateSubmissionStatus(id, status as "Approved" | "Pending" | "Cancelled", note);
    if (!updated) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    addServerLog({
      userId: `usr-${session.username}`,
      userName: session.username,
      userEmail: session.email || "",
      userRole: session.role || "Administrator",
      avatar: session.avatar || "AD",
      action: `Submission ${updated.reference} status changed to ${status}`,
      category: "wallet",
      status: "success",
      severity: "info",
      ipAddress: "127.0.0.1",
      location: "Admin Portal",
      browser: "Admin Action",
      details: {
        submissionId: id,
        reference: updated.reference,
        newStatus: status,
        note: note || "",
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error("PATCH /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

