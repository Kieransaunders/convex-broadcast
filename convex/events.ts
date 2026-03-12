import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getAdminUser, getUser } from "./auth"

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getUser(ctx)
    return await ctx.db.query("events").order("desc").collect()
  },
})

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAdminUser(ctx)
    return await ctx.db.insert("events", {
      ...args,
      status: "scheduled",
      createdBy: user._id,
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("changed"),
        v.literal("cancelled"),
        v.literal("completed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const { id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    // Delete associated links first
    const links = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.id))
      .collect()
    for (const link of links) {
      await ctx.db.delete(link._id)
    }
    await ctx.db.delete(args.id)
  },
})

export const changeStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("changed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    await ctx.db.patch(args.id, { status: args.status })
  },
})

// --- Event-Group Linking ---

export const getGroups = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    const links = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect()
    const groups = await Promise.all(
      links.map(async (link) => {
        const group = await ctx.db.get(link.groupId)
        return group ? { ...group, linkId: link._id } : null
      }),
    )
    return groups.filter(Boolean)
  },
})

export const linkGroup = mutation({
  args: {
    eventId: v.id("events"),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    // Check if already linked
    const existing = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_eventId_groupId", (q) =>
        q.eq("eventId", args.eventId).eq("groupId", args.groupId),
      )
      .unique()
    if (existing) return existing._id
    return await ctx.db.insert("eventGroupLinks", {
      eventId: args.eventId,
      groupId: args.groupId,
      createdAt: Date.now(),
    })
  },
})

export const unlinkGroup = mutation({
  args: { linkId: v.id("eventGroupLinks") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    await ctx.db.delete(args.linkId)
  },
})

export const getByGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    const links = await ctx.db
      .query("eventGroupLinks")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect()
    const events = await Promise.all(
      links.map(async (link) => await ctx.db.get(link.eventId)),
    )
    return events.filter(Boolean)
  },
})
