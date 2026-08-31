import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMongoUser } from "@/utils/mongoDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("brokerage_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { authenticated: false, error: "Unauthenticated session" },
        { status: 401 }
      );
    }

    let rawSession: any;
    try {
      rawSession = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { authenticated: false, error: "Session parsing error" },
        { status: 401 }
      );
    }

    if (!rawSession?.username) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid session structure" },
        { status: 401 }
      );
    }

    // Always fetch live user state and balances from persistent MongoDB Atlas
    const liveUser = await getMongoUser(rawSession.username);

    const isMaster = rawSession.username.toLowerCase() === "jjj";
    const realBal = typeof liveUser?.realBalance === "number" ? liveUser.realBalance : (isMaster ? 100000 : 0);
    const usdtBal = typeof liveUser?.usdtBalance === "number" ? liveUser.usdtBalance : realBal;
    const btcBal = typeof liveUser?.btcBalance === "number" ? liveUser.btcBalance : (isMaster ? 2.45 : 0);
    const demoBal = typeof liveUser?.demoBalance === "number" ? liveUser.demoBalance : (isMaster ? 100000 : 0);
    const stakedBal = typeof liveUser?.stakedBalance === "number" ? liveUser.stakedBalance : (isMaster ? 45200 : 0);
    const miningBal = typeof liveUser?.miningEarnings === "number" ? liveUser.miningEarnings : (isMaster ? 12.4582 : 0);

    const userPayload = {
      username: liveUser?.username || rawSession.username,
      role: liveUser?.role || rawSession.role || "User",
      email: liveUser?.email || rawSession.email || "",
      avatar: liveUser?.avatar || rawSession.avatar || rawSession.username.substring(0, 2).toUpperCase(),
      firstName: liveUser?.firstName || "",
      lastName: liveUser?.lastName || "",
      country: liveUser?.country || "",
      phone: liveUser?.phone || "",
      currency: liveUser?.currency || "USD",
      realBalance: realBal,
      usdtBalance: usdtBal,
      btcBalance: btcBal,
      demoBalance: demoBal,
      stakedBalance: stakedBal,
      miningEarnings: miningBal,
    };

    // Refresh persistent 1-year cookie so the user never gets logged out
    const updatedSessionData = JSON.stringify({
      username: userPayload.username,
      role: userPayload.role,
      email: userPayload.email,
      avatar: userPayload.avatar,
    });

    cookieStore.set("brokerage_session", updatedSessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 Year persistent login
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      path: "/",
    });

    return NextResponse.json({
      authenticated: true,
      user: userPayload,
    });
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json(
      { authenticated: false, error: "Session verification error" },
      { status: 500 }
    );
  }
}
