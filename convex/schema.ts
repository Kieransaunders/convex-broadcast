import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("member"), v.literal("admin"), v.literal("super_admin")),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  groups: defineTable({
    name: v.string(),
    description: v.string(),
    active: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_active", ["active"]),

  groupMemberships: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    role: v.union(v.literal("member"), v.literal("manager")),
    addedBy: v.id("users"),
    addedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_groupId", ["groupId"])
    .index("by_userId_groupId", ["userId", "groupId"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    location: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("changed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_startsAt", ["startsAt"]),

  eventGroupLinks: defineTable({
    eventId: v.id("events"),
    groupId: v.id("groups"),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_groupId", ["groupId"])
    .index("by_eventId_groupId", ["eventId", "groupId"]),

  messages: defineTable({
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
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sent"),
      v.literal("archived"),
    ),
    scheduledFor: v.optional(v.number()),
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
    sentAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"])
    .index("by_scheduledFor", ["scheduledFor"]),

  messageTargets: defineTable({
    messageId: v.id("messages"),
    targetType: v.union(v.literal("group"), v.literal("event")),
    targetId: v.string(),
  })
    .index("by_messageId", ["messageId"]),

  deliveries: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    deliveredAt: v.number(),
    readAt: v.optional(v.number()),
    pushStatus: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("none"),
    ),
  })
    .index("by_messageId", ["messageId"])
    .index("by_userId", ["userId"])
    .index("by_userId_messageId", ["userId", "messageId"]),

  invites: defineTable({
    email: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    expiresAt: v.number(),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  impersonationLogs: defineTable({
    adminUserId: v.id("users"),
    impersonatedUserId: v.id("users"),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_adminUserId", ["adminUserId"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    preference: v.union(
      v.literal("all"),
      v.literal("urgent"),
      v.literal("none"),
    ),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.string(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
})
