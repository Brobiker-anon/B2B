import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const userData = JSON.parse(sessionCookie.value);

    return NextResponse.json({
      authenticated: true,
      user: userData
    });

  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json(
      { authenticated: false, error: "Session corruption detected" },
      { status: 401 }
    );
  }
}
