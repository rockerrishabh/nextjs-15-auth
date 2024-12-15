"use server";

import webpush from "web-push";

webpush.setVapidDetails(
  "mailto: <rishabh.6542@gmail.com>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: webpush.PushSubscription | null = null;

function convertToWebPushSubscription(
  sub: PushSubscription
): webpush.PushSubscription {
  return {
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime || null,
    keys: {
      p256dh: sub.getKey("p256dh")
        ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!)))
        : "",
      auth: sub.getKey("auth")
        ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!)))
        : "",
    },
  };
}

export async function subscribeUser(sub: PushSubscription) {
  subscription = convertToWebPushSubscription(sub);
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error("No subscription available");
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/icon.png",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
