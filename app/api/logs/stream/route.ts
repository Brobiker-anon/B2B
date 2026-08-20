import { logEmitter } from "@/utils/serverDb";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessionCookie = cookies().get("brokerage_session");
  if (!sessionCookie || !sessionCookie.value) {
    return new Response("Unauthorized", { status: 401 });
  }
  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return new Response("Invalid session", { status: 401 });
  }
  if (session?.role !== "Administrator") {
    return new Response("Forbidden. Administrator role required.", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial SSE Handshake signal
      controller.enqueue(
        encoder.encode("event: open\ndata: { \"connected\": true }\n\n")
      );

      // 2. Real-time Log Subscriber
      const onNewLog = (log: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: new-log\ndata: ${JSON.stringify(log)}\n\n`)
          );
        } catch (e) {
          console.error("Error writing log packet to SSE client:", e);
        }
      };

      // 3. Clear Logs database purger subscriber
      const onClearLogs = () => {
        try {
          controller.enqueue(
            encoder.encode("event: clear-logs\ndata: { \"cleared\": true }\n\n")
          );
        } catch (e) {
          console.error("Error writing clear packet to SSE client:", e);
        }
      };

      logEmitter.on("new-log", onNewLog);
      logEmitter.on("clear-logs", onClearLogs);

      // 4. Connection Abort Cleanup handler
      request.signal.addEventListener("abort", () => {
        logEmitter.off("new-log", onNewLog);
        logEmitter.off("clear-logs", onClearLogs);
        try {
          controller.close();
        } catch (e) {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no" // Disable proxy buffering for nginx/vercel
    }
  });
}
