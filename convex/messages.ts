import { v } from "convex/values"
import { query, mutation, internalMutation } from "./_generated/server"
import { internal } from "./_generated/api"
import { getAdminUser, getUser } from "./auth"
import type { Id } from "./_generated/dataModel"
import { ConvexError } from "convex/values"

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
    await getAdminUser(ctx)
    if (args.status) {
      return await ctx.db
        .query("messages")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect()
    }
    return await ctx.db.query("messages").order("desc").collect()
  },
})

export const getById = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    const message = await ctx.db.get(args.id)
    if (!message) return null
    const targets = await ctx.db
      .query("messageTargets")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.id))
      .collect()
    return { ...message, targets }
  },
})

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
    const user = await getAdminUser(ctx)
    const { targetIds, ...messageFields } = args
    const messageId = await ctx.db.insert("messages", {
      ...messageFields,
      status: "draft",
      createdBy: user._id,
      createdAt: Date.now(),
    })
    if (targetIds && args.audienceType !== "all") {
      const targetType = args.audienceType === "groups" ? "group" as const : "event" as const
      for (const targetId of targetIds) {
        await ctx.db.insert("messageTargets", {
          messageId,
          targetType,
          targetId,
        })
      }
    }
    return messageId
  },
})

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
      v.union(
        v.literal("all"),
        v.literal("groups"),
        v.literal("event"),
      ),
    ),
    linkedEventId: v.optional(v.id("events")),
    pushEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const message = await ctx.db.get(args.id)
    if (!message) throw new ConvexError("Message not found")
    if (message.status === "sent" || message.status === "archived") {
      throw new ConvexError("Cannot edit sent or archived messages")
    }
    const { id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export const archive = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const message = await ctx.db.get(args.id)
    if (!message) throw new ConvexError("Message not found")
    if (message.status !== "sent") throw new ConvexError("Can only archive sent messages")
    await ctx.db.patch(args.id, { status: "archived" })
  },
})

// --- Audience Resolution ---

export const resolveAudience = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId)
    if (!message) throw new ConvexError("Message not found")

    let userIds: Id<"users">[] = []

    if (message.audienceType === "all") {
      const users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect()
      userIds = users.map((u) => u._id)
    } else {
      const targets = await ctx.db
        .query("messageTargets")
        .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
        .collect()

      if (message.audienceType === "groups") {
        const membershipSets = await Promise.all(
          targets.map((t) =>
            ctx.db
              .query("groupMemberships")
              .withIndex("by_groupId", (q) => q.eq("groupId", t.targetId as Id<"groups">))
              .collect(),
          ),
        )
        const uniqueIds = new Set(membershipSets.flat().map((m) => m.userId))
        userIds = [...uniqueIds]
      } else if (message.audienceType === "event") {
        // Event audience: for now, all active users
        const allUsers = await ctx.db
          .query("users")
          .withIndex("by_status", (q) => q.eq("status", "active"))
          .collect()
        userIds = allUsers.map((u) => u._id)
      }
    }

    // Create delivery records
    const now = Date.now()
    for (const userId of userIds) {
      await ctx.db.insert("deliveries", {
        messageId: args.messageId,
        userId,
        deliveredAt: now,
        pushStatus: message.pushEnabled ? "pending" : "none",
      })
    }

    return userIds
  },
})

// --- Send Logic ---

export const sendNow = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const message = await ctx.db.get(args.id)
    if (!message) throw new ConvexError("Message not found")
    if (message.status === "sent") throw new ConvexError("Message already sent")

    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.messages.resolveAudience, {
      messageId: args.id,
    })

    if (message.pushEnabled) {
      await ctx.scheduler.runAfter(500, internal.pushActions.sendPushForMessage, {
        messageId: args.id,
      })
    }
  },
})

export const schedule = mutation({
  args: {
    id: v.id("messages"),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const message = await ctx.db.get(args.id)
    if (!message) throw new ConvexError("Message not found")
    if (message.status === "sent") throw new ConvexError("Cannot schedule sent message")

    // Cancel existing scheduled function if rescheduling
    if (message.scheduledFunctionId) {
      await ctx.scheduler.cancel(message.scheduledFunctionId)
    }

    const scheduledFunctionId = await ctx.scheduler.runAt(
      args.scheduledFor,
      internal.messages.executeSend,
      { messageId: args.id },
    )

    await ctx.db.patch(args.id, {
      status: "scheduled",
      scheduledFor: args.scheduledFor,
      scheduledFunctionId,
    })
  },
})

export const cancelScheduled = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const message = await ctx.db.get(args.id)
    if (!message) throw new ConvexError("Message not found")
    if (message.status !== "scheduled") throw new ConvexError("Message is not scheduled")

    if (message.scheduledFunctionId) {
      await ctx.scheduler.cancel(message.scheduledFunctionId)
    }

    await ctx.db.patch(args.id, {
      status: "draft",
      scheduledFor: undefined,
      scheduledFunctionId: undefined,
    })
  },
})

export const executeSend = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId)
    if (!message || message.status !== "scheduled") return

    await ctx.db.patch(args.messageId, {
      status: "sent",
      sentAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.messages.resolveAudience, {
      messageId: args.messageId,
    })

    if (message.pushEnabled) {
      await ctx.scheduler.runAfter(500, internal.pushActions.sendPushForMessage, {
        messageId: args.messageId,
      })
    }
  },
})

// --- Member Feed ---

export const feed = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50)

    const messages = await Promise.all(
      deliveries.map(async (d) => {
        const message = await ctx.db.get(d.messageId)
        return message ? { ...message, delivery: d } : null
      }),
    )
    return messages.filter(Boolean)
  },
})

export const getMyDelivery = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)
    const delivery = await ctx.db
      .query("deliveries")
      .withIndex("by_userId_messageId", (q) =>
        q.eq("userId", user._id).eq("messageId", args.messageId),
      )
      .unique()
    return delivery
  },
})

export const markRead = mutation({
  args: { deliveryId: v.id("deliveries") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    await ctx.db.patch(args.deliveryId, { readAt: Date.now() })
  },
})

// --- Delivery Stats ---

export const getDeliveryStats = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect()

    return {
      total: deliveries.length,
      read: deliveries.filter((d) => d.readAt).length,
      pushSent: deliveries.filter((d) => d.pushStatus === "sent").length,
      pushFailed: deliveries.filter((d) => d.pushStatus === "failed").length,
      pushPending: deliveries.filter((d) => d.pushStatus === "pending").length,
    }
  },
})
