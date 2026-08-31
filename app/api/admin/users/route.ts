import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getAdminUsers, 
  getSubmissions, 
  getChatsAsync, 
  updateUserBalance, 
  deleteAdminUser, 
  updateAdminUser,
  parseJsonBody 
} from "@/utils/serverDb";

export const dynamic = "force-dynamic";

async function verifyAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("brokerage_session");

  if (!sessionCookie?.value) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session?.role === "Administrator") {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const rawUsers = await getAdminUsers();
    const submissions = await getSubmissions();
    const chats = await getChatsAsync();

    const users = rawUsers.map((u: any) => {
      const isMaster = u.username?.toLowerCase() === "jjj";
      const realBal = typeof u.realBalance === "number" ? u.realBalance : (isMaster ? 100000 : 0);
      const usdtBal = typeof u.usdtBalance === "number" ? u.usdtBalance : realBal;
      const btcBal = typeof u.btcBalance === "number" ? u.btcBalance : (isMaster ? 2.45 : 0);
      const demoBal = typeof u.demoBalance === "number" ? u.demoBalance : (isMaster ? 100000 : 0);
      const stakedBal = typeof u.stakedBalance === "number" ? u.stakedBalance : (isMaster ? 45200 : 0);
      const miningBal = typeof u.miningEarnings === "number" ? u.miningEarnings : (isMaster ? 12.4582 : 0);

      // Gather submissions for this user
      const userSubmissions = submissions.filter(
        (s: any) => s.username?.toLowerCase() === u.username?.toLowerCase() || s.email?.toLowerCase() === u.email?.toLowerCase()
      );

      // Find chat for this user if any
      const userChat = chats.find(
        (c: any) => c.username?.toLowerCase() === u.username?.toLowerCase()
      );

      return {
        username: u.username,
        password: u.password || "",
        email: u.email || "",
        role: u.role || "User",
        avatar: u.avatar || u.username?.substring(0, 2).toUpperCase() || "??",
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        country: u.country || "",
        phone: u.phone || "",
        currency: u.currency || "USD",
        referralCode: u.referralCode || "",
        createdAt: u.createdAt || new Date().toISOString(),
        realBalance: realBal,
        usdtBalance: usdtBal,
        btcBalance: btcBal,
        demoBalance: demoBal,
        stakedBalance: stakedBal,
        miningEarnings: miningBal,
        submissionsCount: userSubmissions.length,
        hasChat: Boolean(userChat && userChat.messages?.length > 0),
        submissions: userSubmissions,
      };
    });

    return NextResponse.json({
      success: true,
      requestedBy: session.username,
      users,
      submissions,
      totalUsers: users.length,
      totalRealBalance: users.reduce((acc: number, cur: any) => acc + (cur.realBalance || 0), 0),
      totalSubmissions: submissions.length,
      totalPendingSubmissions: submissions.filter((s: any) => s.status === "Pending").length,
    });
  } catch (err) {
    console.error("Error in admin/users GET route:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const body = await parseJsonBody(request);
    const { action, username, operation, asset, amount, note, updates } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    if (action === "adjust_balance") {
      if (!username || !operation || !asset || typeof amount !== "number") {
        return NextResponse.json(
          { error: "Missing required balance adjustment parameters (username, operation, asset, amount)." },
          { status: 400 }
        );
      }

      const validOps = ["add", "deduct", "set"];
      if (!validOps.includes(operation)) {
        return NextResponse.json({ error: "Invalid operation. Use 'add', 'deduct', or 'set'." }, { status: 400 });
      }

      const validAssets = ["realBalance", "usdtBalance", "btcBalance", "demoBalance", "stakedBalance", "miningEarnings"];
      if (!validAssets.includes(asset)) {
        return NextResponse.json({ error: "Invalid asset type specified." }, { status: 400 });
      }

      const updatedUser = await updateUserBalance(
        username,
        operation as "add" | "deduct" | "set",
        asset as any,
        Math.abs(amount),
        note || `Admin manual adjustment by ${session.username}`
      );

      if (!updatedUser) {
        return NextResponse.json({ error: "User account not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully ${operation === "add" ? "added" : operation === "deduct" ? "deducted" : "set"} ${amount} ${asset} for ${username}.`,
        user: updatedUser,
      });
    }

    if (action === "delete_user") {
      if (!username) {
        return NextResponse.json({ error: "Username is required." }, { status: 400 });
      }

      if (username.toLowerCase() === session.username.toLowerCase()) {
        return NextResponse.json({ error: "Cannot delete currently logged in admin account." }, { status: 400 });
      }

      const deleted = await deleteAdminUser(username);
      if (!deleted) {
        return NextResponse.json({ error: "User account not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: `Account ${username} removed successfully.` });
    }

    if (action === "update_user") {
      if (!username || !updates) {
        return NextResponse.json({ error: "Username and updates required." }, { status: 400 });
      }

      const updated = await updateAdminUser(username, updates);
      if (!updated) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (err) {
    console.error("Error in admin/users POST route:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
