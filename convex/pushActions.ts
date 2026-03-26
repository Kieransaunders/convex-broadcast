"use node";

import { v } from "convex/values";
import webpush from "web-push";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// --- Push Sending (Node.js action) ---

export const sendPushForMessage = internalAction({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(internal.push.getMessageForPush, {
      messageId: args.messageId,
    });
    if (!message) return;

    const deliveries = await ctx.runQuery(internal.push.getPendingDeliveries, {
      messageId: args.messageId,
    });

    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublic || !vapidPrivate) {
      console.error("Missing VAPID keys. Push notifications cannot be sent.");
      // Mark all deliveries as failed
      for (const delivery of deliveries) {
        await ctx.runMutation(internal.push.updateDeliveryPushStatus, {
          deliveryId: delivery._id,
          status: "failed",
        });
      }
      return;
    }

    const contactEmail =
      process.env.VAPID_CONTACT_EMAIL ?? "mailto:admin@orgcomms.app";
    webpush.setVapidDetails(contactEmail, vapidPublic, vapidPrivate);

    for (const delivery of deliveries) {
      const subs = await ctx.runQuery(internal.push.getUserSubscriptions, {
        userId: delivery.userId,
      });

      // Get unread count for badge
      const unreadCount = await ctx.runQuery(internal.push.getUserUnreadCount, {
        userId: delivery.userId,
      });

      let anySent = false;

      for (const sub of subs) {
        // Filter by preference
        if (sub.preference === "none") continue;
        if (sub.preference === "urgent" && message.category !== "urgent")
          continue;

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({
              title: message.title,
              body: message.body.substring(0, 200),
              url: `/messages/${args.messageId}`,
              badgeCount: unreadCount,
            }),
          );
          anySent = true;
        } catch (error) {
          console.error("Push failed for subscription", sub._id, error);
          // If subscription is gone (410), clean it up
          if ((error as any)?.statusCode === 410) {
            await ctx.runMutation(internal.push.removeSubscription, {
              subscriptionId: sub._id,
            });
          }
        }
      }

      await ctx.runMutation(internal.push.updateDeliveryPushStatus, {
        deliveryId: delivery._id,
        status: anySent ? "sent" : "failed",
      });
    }
  },
});

export const sendTestPush = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublic || !vapidPrivate) {
      throw new Error("VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Convex dashboard.");
    }

    const contactEmail =
      process.env.VAPID_CONTACT_EMAIL ?? "mailto:admin@orgcomms.app";
    webpush.setVapidDetails(contactEmail, vapidPublic, vapidPrivate);

    const subs = await ctx.runQuery(internal.push.getUserSubscriptions, {
      userId: args.userId,
    });

    if (subs.length === 0) {
      throw new Error("No push subscriptions found. Please enable push notifications first.");
    }

    const unreadCount = await ctx.runQuery(internal.push.getUserUnreadCount, {
      userId: args.userId,
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: `[Test] ${args.title}`,
            body: args.body,
            url: "/inbox",
            badgeCount: unreadCount,
          }),
        );
        sentCount++;
      } catch (error) {
        console.error("Test push failed for subscription", sub._id, error);
        failedCount++;
        if ((error as any)?.statusCode === 410) {
          await ctx.runMutation(internal.push.removeSubscription, {
            subscriptionId: sub._id,
          });
        }
      }
    }

    if (sentCount === 0) {
      throw new Error(`Failed to send test notification to any device. ${failedCount} subscription(s) failed.`);
    }

    return { sentCount, failedCount };
  },
});
