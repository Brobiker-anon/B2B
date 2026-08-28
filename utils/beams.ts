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
  const instanceId = process.env.PUSHER_BEAMS_INSTANCE_ID || "05471679-dad5-4e1f-a33c-f8edb415c329";
  const secretKey = process.env.PUSHER_BEAMS_SECRET_KEY || "AF8E68CFE9506866E32C9F9DB2E9F458728BF1B357C6F418C3930CD9B080C31D";

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
