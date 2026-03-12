import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getAdminUser, getUser } from "./auth"

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getUser(ctx)
    return await ctx.db.query("groups").filter((q) => q.eq(q.field("active"), true)).collect()
  },
})

export const getById = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAdminUser(ctx)
    return await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      active: true,
      createdBy: user._id,
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    const { id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export const getMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    await getUser(ctx)
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect()
    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId)
        return { ...m, user }
      }),
    )
    return members
  },
})

export const addMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("member"), v.literal("manager")),
  },
  handler: async (ctx, args) => {
    const admin = await getAdminUser(ctx)
    const existing = await ctx.db
      .query("groupMemberships")
      .withIndex("by_userId_groupId", (q) =>
        q.eq("userId", args.userId).eq("groupId", args.groupId),
      )
      .unique()
    if (existing) return existing._id
    return await ctx.db.insert("groupMemberships", {
      userId: args.userId,
      groupId: args.groupId,
      role: args.role,
      addedBy: admin._id,
      addedAt: Date.now(),
    })
  },
})

export const removeMember = mutation({
  args: { membershipId: v.id("groupMemberships") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    await ctx.db.delete(args.membershipId)
  },
})
