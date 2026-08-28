/**
 * Pusher Beams Push Notification Helper
 */
export async function sendPushNotification({
  interests,
  title,
  body,
  deepLink,
}: {
  interests: string[];
  title: string;
  body: string;
  deepLink?: string;
}) {
  const instanceId = process.env.PUSHER_BEAMS_INSTANCE_ID || process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID || "";
  const secretKey = process.env.PUSHER_BEAMS_SECRET_KEY || "";

  if (!instanceId || !secretKey) return null;

  try {
    const res = await fetch(
      `https://${instanceId}.pushnotifications.pusher.com/publish_api/v1/instances/${instanceId}/publishes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify({
          interests,
          web: {
            notification: {
              title,
              body,
              deep_link: deepLink,
            },
          },
        }),
      }
    );
    return await res.json();
  } catch (err) {
    console.error("Pusher Beams send error:", err);
    return null;
  }
}
