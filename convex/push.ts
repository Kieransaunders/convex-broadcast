import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getUser } from "./auth";

// --- Subscription Management ---

export const subscribe = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    preference: v.union(
      v.literal("all"),
      v.literal("urgent"),
      v.literal("none"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    // Remove existing subscription for this endpoint
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const match = existing.find((s) => s.endpoint === args.endpoint);
    if (match) await ctx.db.delete("pushSubscriptions", match._id);

    return await ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      preference: args.preference,
      createdAt: Date.now(),
    });
  },
});

export const unsubscribe = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const match = subs.find((s) => s.endpoint === args.endpoint);
    if (match) await ctx.db.delete("pushSubscriptions", match._id);
  },
});

export const updatePreference = mutation({
  args: {
    preference: v.union(
      v.literal("all"),
      v.literal("urgent"),
      v.literal("none"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const sub of subs) {
      await ctx.db.patch("pushSubscriptions", sub._id, { preference: args.preference });
    }
  },
});

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return subs[0] ?? null;
  },
});

export const getVapidPublicKey = query({
  args: {},
  handler: () => {
    return process.env.VAPID_PUBLIC_KEY ?? null;
  },
});

// --- Internal helpers for the action ---

export const getMessageForPush = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get("messages", args.messageId);
  },
});

export const getPendingDeliveries = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliveries")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("pushStatus"), "pending"))
      .collect();
  },
});

export const getUserSubscriptions = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const updateDeliveryPushStatus = internalMutation({
  args: {
    deliveryId: v.id("deliveries"),
    status: v.union(v.literal("sent"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch("deliveries", args.deliveryId, { pushStatus: args.status });
  },
});

export const removeSubscription = internalMutation({
  args: { subscriptionId: v.id("pushSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete("pushSubscriptions", args.subscriptionId);
  },
});

// --- Badge count helper ---

export const getUserUnreadCount = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return deliveries.filter((d) => d.readAt === undefined).length;
  },
});
