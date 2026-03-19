import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAdminUser, getUser, getSuperAdminUser, safeGetUser } from "./auth";
import type { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

// --- Queries ---

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("sent"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    if (args.status) {
      return await ctx.db
        .query("messages")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) return null;
    const targets = await ctx.db
      .query("messageTargets")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.id))
      .collect();
    return { ...message, targets };
  },
});

// --- Mutations ---

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    category: v.union(
      v.literal("notice"),
      v.literal("reminder"),
      v.literal("event_update"),
      v.literal("urgent"),
    ),
    audienceType: v.union(
      v.literal("all"),
      v.literal("groups"),
      v.literal("event"),
    ),
    linkedEventId: v.optional(v.id("events")),
    pushEnabled: v.boolean(),
    targetIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getAdminUser(ctx);
    const { targetIds, ...messageFields } = args;
    const messageId = await ctx.db.insert("messages", {
      ...messageFields,
      status: "draft",
      createdBy: user._id,
      createdAt: Date.now(),
    });
    if (targetIds && args.audienceType !== "all") {
      const targetType =
        args.audienceType === "groups"
          ? ("group" as const)
          : ("event" as const);
      for (const targetId of targetIds) {
        await ctx.db.insert("messageTargets", {
          messageId,
          targetType,
          targetId,
        });
      }
    }
    return messageId;
  },
});

export const update = mutation({
  args: {
    id: v.id("messages"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("notice"),
        v.literal("reminder"),
        v.literal("event_update"),
        v.literal("urgent"),
      ),
    ),
    audienceType: v.optional(
      v.union(v.literal("all"), v.literal("groups"), v.literal("event")),
    ),
    linkedEventId: v.optional(v.id("events")),
    pushEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status === "sent" || message.status === "archived") {
      throw new ConvexError("Cannot edit sent or archived messages");
    }
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const archive = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status !== "sent")
      throw new ConvexError("Can only archive sent messages");
    await ctx.db.patch(args.id, { status: "archived" });
  },
});

export const deleteDraft = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status !== "draft")
      throw new ConvexError("Can only delete draft messages");
    const targets = await ctx.db
      .query("messageTargets")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.id))
      .collect();
    for (const target of targets) {
      await ctx.db.delete(target._id);
    }
    await ctx.db.delete(args.id);
  },
});

// Admin: Delete any message (sent or draft) - removes from all users
// Uses internal action to handle large batches of deliveries without hitting limits
export const deleteMessage = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getSuperAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");

    // Delete message targets (usually small number)
    const targets = await ctx.db
      .query("messageTargets")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.id))
      .take(100);
    for (const target of targets) {
      await ctx.db.delete(target._id);
    }

    // Delete the message itself first to prevent new deliveries
    await ctx.db.delete(args.id);

    // Schedule background cleanup of deliveries (could be thousands)
    // This avoids hitting the 1024 operation limit per mutation
    await ctx.scheduler.runAfter(0, internal.messages.cleanupDeliveries, {
      messageId: args.id,
    });
  },
});

// Internal: Cleanup deliveries for a deleted message in batches
export const cleanupDeliveries = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    // Get up to 100 deliveries at a time
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .take(100);

    if (deliveries.length === 0) {
      // No more deliveries to delete, we're done
      return;
    }

    // Delete this batch
    for (const delivery of deliveries) {
      await ctx.db.delete(delivery._id);
    }

    // Schedule next batch if we found 100 (there might be more)
    if (deliveries.length === 100) {
      await ctx.scheduler.runAfter(0, internal.messages.cleanupDeliveries, {
        messageId: args.messageId,
      });
    }
  },
});

// User: Delete a message from their own feed (removes delivery record)
export const deleteMyDelivery = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    // Find the user's delivery record for this message
    const delivery = await ctx.db
      .query("deliveries")
      .withIndex("by_userId_messageId", (q) =>
        q.eq("userId", user._id).eq("messageId", args.messageId)
      )
      .unique();
    
    if (delivery) {
      await ctx.db.delete(delivery._id);
    }
  },
});

// --- Audience Resolution ---

export const resolveAudience = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Message not found");

    let userIds: Id<"users">[] = [];

    if (message.audienceType === "all") {
      const users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect();
      userIds = users.map((u) => u._id);
    } else {
      const targets = await ctx.db
        .query("messageTargets")
        .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
        .collect();

      if (message.audienceType === "groups") {
        const membershipSets = await Promise.all(
          targets.map((t) =>
            ctx.db
              .query("groupMemberships")
              .withIndex("by_groupId", (q) =>
                q.eq("groupId", t.targetId as Id<"groups">),
              )
              .collect(),
          ),
        );
        const uniqueIds = new Set(membershipSets.flat().map((m) => m.userId));
        userIds = [...uniqueIds];
      } else if (message.audienceType === "event") {
        // Event audience: for now, all active users
        const allUsers = await ctx.db
          .query("users")
          .withIndex("by_status", (q) => q.eq("status", "active"))
          .collect();
        userIds = allUsers.map((u) => u._id);
      }
    }

    // Create delivery records
    const now = Date.now();
    for (const userId of userIds) {
      await ctx.db.insert("deliveries", {
        messageId: args.messageId,
        userId,
        deliveredAt: now,
        pushStatus: message.pushEnabled ? "pending" : "none",
      });
    }

    // Schedule push after deliveries exist to avoid race condition
    if (message.pushEnabled && userIds.length > 0) {
      await ctx.scheduler.runAfter(0, internal.pushActions.sendPushForMessage, {
        messageId: args.messageId,
      });
    }

    return userIds;
  },
});

// --- Send Logic ---

export const sendNow = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status === "sent")
      throw new ConvexError("Message already sent");

    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.messages.resolveAudience, {
      messageId: args.id,
    });
  },
});

export const schedule = mutation({
  args: {
    id: v.id("messages"),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status === "sent")
      throw new ConvexError("Cannot schedule sent message");

    // Cancel existing scheduled function if rescheduling
    if (message.scheduledFunctionId) {
      await ctx.scheduler.cancel(message.scheduledFunctionId);
    }

    const scheduledFunctionId = await ctx.scheduler.runAt(
      args.scheduledFor,
      internal.messages.executeSend,
      { messageId: args.id },
    );

    await ctx.db.patch(args.id, {
      status: "scheduled",
      scheduledFor: args.scheduledFor,
      scheduledFunctionId,
    });
  },
});

export const cancelScheduled = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status !== "scheduled")
      throw new ConvexError("Message is not scheduled");

    if (message.scheduledFunctionId) {
      await ctx.scheduler.cancel(message.scheduledFunctionId);
    }

    await ctx.db.patch(args.id, {
      status: "draft",
      scheduledFor: undefined,
      scheduledFunctionId: undefined,
    });
  },
});

export const executeSend = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.status !== "scheduled") return;

    await ctx.db.patch(args.messageId, {
      status: "sent",
      sentAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.messages.resolveAudience, {
      messageId: args.messageId,
    });
  },
});

// --- Member Feed ---

export const feed = query({
  args: {
    filter: v.optional(v.union(v.literal("all"), v.literal("read"), v.literal("unread"))),
  },
  handler: async (ctx, args) => {
    const user = await safeGetUser(ctx);
    if (!user) return [];
    let deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    // Apply read/unread filter
    if (args.filter === "read") {
      deliveries = deliveries.filter((d) => d.readAt !== undefined);
    } else if (args.filter === "unread") {
      deliveries = deliveries.filter((d) => d.readAt === undefined);
    }

    // Fetch messages using Promise.all - while this is N queries, each is a
    // fast primary key lookup (db.get). Convex automatically batches these
    // internally within the same transaction for better performance.
    const messages = await Promise.all(
      deliveries.map(async (d) => {
        const message = await ctx.db.get(d.messageId);
        return message ? { ...message, delivery: d } : null;
      }),
    );
    return messages.filter(Boolean);
  },
});

export const getMyDelivery = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const delivery = await ctx.db
      .query("deliveries")
      .withIndex("by_userId_messageId", (q) =>
        q.eq("userId", user._id).eq("messageId", args.messageId),
      )
      .unique();
    return delivery;
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetUser(ctx);
    if (!user) return 0;
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return deliveries.filter((d) => d.readAt === undefined).length;
  },
});

export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    const [users, allMessages, recentMessages] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("messages").collect(),
      ctx.db.query("messages").order("desc").take(5),
    ]);
    return {
      userCount: users.length,
      totalCount: allMessages.length,
      sentCount: allMessages.filter((m) => m.status === "sent").length,
      recentMessages,
    };
  },
});

export const markRead = mutation({
  args: { deliveryId: v.id("deliveries") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    await ctx.db.patch(args.deliveryId, { readAt: Date.now() });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    // Get all deliveries for the user and filter unread in memory
    // since Convex doesn't support filtering by field existence
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const unreadDeliveries = deliveries.filter((d) => d.readAt === undefined);

    for (const delivery of unreadDeliveries) {
      await ctx.db.patch(delivery._id, { readAt: Date.now() });
    }

    return { markedAsRead: unreadDeliveries.length };
  },
});

// --- Delivery Stats ---

export const getDeliveryStats = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();

    return {
      total: deliveries.length,
      read: deliveries.filter((d) => d.readAt).length,
      pushSent: deliveries.filter((d) => d.pushStatus === "sent").length,
      pushFailed: deliveries.filter((d) => d.pushStatus === "failed").length,
      pushPending: deliveries.filter((d) => d.pushStatus === "pending").length,
    };
  },
});
