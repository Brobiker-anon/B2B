import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addSubmission, getSubmissions, updateSubmissionStatus, updateUserBalance, addServerLog } from "@/utils/serverDb";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryUser = searchParams.get("username");
    const queryType = searchParams.get("type");
    const session = await getSession();

    let submissions = getSubmissions();

    if (session?.role === "Administrator" && !queryUser) {
      if (queryType) {
        submissions = submissions.filter((s) => s.type === queryType);
      }
      return NextResponse.json({
        success: true,
        submissions,
      });
    }

    const targetUser = queryUser || session?.username;
    if (!targetUser) {
      return NextResponse.json({
        success: true,
        submissions: [],
      });
    }

    let userSubmissions = submissions.filter(
      (s) => s.username?.toLowerCase() === targetUser.toLowerCase()
    );

    if (queryType) {
      userSubmissions = userSubmissions.filter((s) => s.type === queryType);
    }

    return NextResponse.json({
      success: true,
      submissions: userSubmissions,
    });
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    let { username, email, type, reference, method, amountVal, amountAsset, totalUsd, status, details } = body;

    const targetUsername = session?.username || username;
    if (!targetUsername) {
      return NextResponse.json({ error: "Please sign in to submit." }, { status: 401 });
    }

    const normalizedType = type === "withdrawal" || type === "withdraw" ? "withdraw" : type === "deposit" ? "deposit" : null;

    if (!normalizedType) {
      return NextResponse.json({ error: "Invalid submission type." }, { status: 400 });
    }

    const submission = addSubmission({
      type: normalizedType,
      username: targetUsername,
      email: session?.email || email || "",
      reference: reference || `REF-${Date.now()}`,
      method: method || "Unknown",
      amountVal: String(amountVal || "0"),
      amountAsset: amountAsset || "USD",
      totalUsd: totalUsd || "$0.00",
      status: status || "Pending",
      details: details || {},
    });

    addServerLog({
      userId: `usr-${targetUsername}`,
      userName: targetUsername,
      userEmail: session?.email || email || "",
      userRole: session?.role || "User",
      avatar: session?.avatar || targetUsername.substring(0, 2).toUpperCase(),
      action: `${normalizedType === "deposit" ? "Deposit" : "Withdrawal"} submitted: ${submission.reference} (${submission.totalUsd})`,
      category: "wallet",
      status: "success",
      severity: "info",
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      location: "ApexVeltrix Portal",
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
    const body = await request.json();
    const { id, status, note } = body;

    if (!id || !status || !["Approved", "Pending", "Cancelled"].includes(status)) {
      return NextResponse.json({ error: "Valid submission ID and status ('Approved' | 'Pending' | 'Cancelled') required." }, { status: 400 });
    }

    const updated = updateSubmissionStatus(id, status as "Approved" | "Pending" | "Cancelled", note);
    if (!updated) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    // If a deposit is approved and balance hasn't been credited yet, credit the user balance
    if (status === "Approved" && updated.type === "deposit" && !updated.details?.balanceCredited) {
      const rawAmt = parseFloat(String(updated.amountVal || "0").replace(/[^0-9.]/g, "")) || 0;
      const usdVal = parseFloat(String(updated.totalUsd || "0").replace(/[^0-9.]/g, "")) || (rawAmt > 10 ? rawAmt : rawAmt * 63000);
      
      const assetToCredit = updated.amountAsset === "BTC" ? "btcBalance" : updated.amountAsset === "USDT" ? "usdtBalance" : "realBalance";
      const amountToCredit = updated.amountAsset === "BTC" ? rawAmt : (usdVal || rawAmt);

      if (amountToCredit > 0 && updated.username) {
        updateUserBalance(updated.username, "add", assetToCredit, amountToCredit, `Auto-credit for approved deposit ${updated.reference}`);
      }
    }

    addServerLog({
      userId: `usr-${session?.username || "admin"}`,
      userName: session?.username || "Administrator",
      userEmail: session?.email || "admin@apexveltrix.com",
      userRole: session?.role || "Administrator",
      avatar: "AD",
      action: `Submission ${updated.reference} status changed to ${status}`,
      category: "wallet",
      status: "success",
      severity: "info",
      ipAddress: "127.0.0.1",
      location: "ApexVeltrix Admin Portal",
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


