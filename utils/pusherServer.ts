import Pusher from "pusher";

let pusherServerInstance: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServerInstance) {
    pusherServerInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID || "2189902",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || "4d2d25a93139dc19fadb",
      secret: process.env.PUSHER_SECRET || "f6ed2e9c302aadc67609",
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
