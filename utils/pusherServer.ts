import Pusher from "pusher";

let pusherServerInstance: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServerInstance) {
    pusherServerInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID || "",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
      secret: process.env.PUSHER_SECRET || "",
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
      useTLS: true,
    });
  }
  return pusherServerInstance;
}

export async function triggerPusherEvent(
  channels: string | string[],
  event: string,
  data: any
) {
  try {
    const pusher = getPusherServer();
    await pusher.trigger(channels, event, data);
  } catch (err) {
    console.error("Pusher WebSocket trigger error:", err);
  }
}
