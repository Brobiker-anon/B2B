import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  addSubmission,
  getSubmissions,
  updateSubmissionStatus,
  updateSubmission,
  deleteSubmission,
  updateUserBalance,
  addServerLog,
} from "@/utils/serverDb";

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
    let {
      username,
      email,
      type,
      reference,
      method,
      amountVal,
      amountAsset,
      totalUsd,
      status,
      details,
      creditBalance,
    } = body;

    const isAdmin = session?.role === "Administrator";
    const targetUsername = isAdmin && username ? username : session?.username || username;

    if (!targetUsername) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    const normalizedType =
      type === "withdrawal" || type === "withdraw" ? "withdraw" : "deposit";

    const finalStatus = status || (isAdmin ? "Approved" : "Pending");
    const finalRef = reference || (isAdmin ? `DEP-${Math.floor(100000 + Math.random() * 900000)}` : `REF-${Date.now()}`);
    const finalAmountVal = String(amountVal || "0");
    const finalAsset = amountAsset || "USDT";
    const finalTotalUsd = totalUsd || (finalAsset === "BTC" ? `$${(parseFloat(finalAmountVal) * 63000).toFixed(2)}` : `$${parseFloat(finalAmountVal).toFixed(2)}`);

    const submission = addSubmission({
      type: normalizedType,
      username: targetUsername,
      email: email || session?.email || `${targetUsername}@user.net`,
      reference: finalRef,
      method: method || (isAdmin ? "Admin Manual Entry" : "Crypto"),
      amountVal: finalAmountVal,
      amountAsset: finalAsset,
      totalUsd: finalTotalUsd,
      status: finalStatus,
      details: {
        ...(details || {}),
        createdAt: new Date().toISOString(),
        createdBy: isAdmin ? session?.username || "Administrator" : targetUsername,
      },
    });

    // If Admin explicitly requests crediting balance or if an Approved deposit was created with creditBalance
    if (creditBalance && finalStatus === "Approved" && normalizedType === "deposit") {
      const rawAmt = parseFloat(finalAmountVal) || 0;
      const assetToCredit = finalAsset === "BTC" ? "btcBalance" : finalAsset === "USDT" ? "usdtBalance" : "realBalance";
      const amountToCredit = finalAsset === "BTC" ? rawAmt : (parseFloat(finalTotalUsd.replace(/[^0-9.]/g, "")) || rawAmt);

      if (amountToCredit > 0) {
        updateUserBalance(
          targetUsername,
          "add",
          assetToCredit,
          amountToCredit,
          `Direct balance credit for created deposit ${submission.reference}`,
          true
        );
      }
    }

    addServerLog({
      userId: `usr-${session?.username || targetUsername}`,
      userName: session?.username || targetUsername,
      userEmail: session?.email || email || "",
      userRole: session?.role || "User",
      avatar: session?.avatar || targetUsername.substring(0, 2).toUpperCase(),
      action: `${isAdmin ? "Admin created" : "New"} ${normalizedType}: ${submission.reference} (${submission.totalUsd}) for ${targetUsername}`,
      category: "wallet",
      status: "success",
      severity: "info",
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      location: isAdmin ? "Admin Console" : "ApexVeltrix Portal",
      browser: request.headers.get("user-agent") || "Unknown",
      details: submission,
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "Administrator") {
      return NextResponse.json({ error: "Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Submission ID is required." }, { status: 400 });
    }

    const updated = updateSubmission(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    addServerLog({
      userId: `usr-${session.username}`,
      userName: session.username,
      userEmail: session.email || "admin@apexveltrix.com",
      userRole: "Administrator",
      avatar: "AD",
      action: `Admin updated submission ${updated.reference} for ${updated.username}`,
      category: "wallet",
      status: "success",
      severity: "info",
      ipAddress: "127.0.0.1",
      location: "ApexVeltrix Admin Portal",
      browser: "Admin Action",
      details: { id, updates },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error("PUT /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { id, status, note } = body;

    if (!id || !status || !["Approved", "Pending", "Cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Valid submission ID and status ('Approved' | 'Pending' | 'Cancelled') required." },
        { status: 400 }
      );
    }

    const updated = updateSubmissionStatus(id, status as "Approved" | "Pending" | "Cancelled", note);
    if (!updated) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    // If a deposit is approved and balance hasn't been credited yet, credit the user balance
    if (status === "Approved" && updated.type === "deposit" && !updated.details?.balanceCredited) {
      const rawAmt = parseFloat(String(updated.amountVal || "0").replace(/[^0-9.]/g, "")) || 0;
      const usdVal =
        parseFloat(String(updated.totalUsd || "0").replace(/[^0-9.]/g, "")) ||
        (rawAmt > 10 ? rawAmt : rawAmt * 63000);

      const assetToCredit =
        updated.amountAsset === "BTC"
          ? "btcBalance"
          : updated.amountAsset === "USDT"
          ? "usdtBalance"
          : "realBalance";
      const amountToCredit = updated.amountAsset === "BTC" ? rawAmt : usdVal || rawAmt;

      if (amountToCredit > 0 && updated.username) {
        updateUserBalance(
          updated.username,
          "add",
          assetToCredit,
          amountToCredit,
          `Auto-credit for approved deposit ${updated.reference}`,
          true
        );
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

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "Administrator") {
      return NextResponse.json({ error: "Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Submission ID is required." }, { status: 400 });
    }

    const deleted = deleteSubmission(id);
    if (!deleted) {
      return NextResponse.json({ error: "Submission not found or already deleted." }, { status: 404 });
    }

    addServerLog({
      userId: `usr-${session.username}`,
      userName: session.username,
      userEmail: session.email || "admin@apexveltrix.com",
      userRole: "Administrator",
      avatar: "AD",
      action: `Admin permanently deleted submission record ${id}`,
      category: "wallet",
      status: "warning",
      severity: "warning",
      ipAddress: "127.0.0.1",
      location: "ApexVeltrix Admin Portal",
      browser: "Admin Action",
      details: { id },
    });

    return NextResponse.json({ success: true, message: `Submission ${id} deleted successfully.` });
  } catch (error) {
    console.error("DELETE /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}


