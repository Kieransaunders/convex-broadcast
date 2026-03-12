import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAdminUser, getSuperAdminUser, getUser } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    return await ctx.db.query("users").collect();
  },
});

export const getById = query({
  args: { id: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    await getUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("member"),
      v.literal("admin"),
      v.literal("super_admin"),
    ),
  },
  handler: async (ctx, args) => {
    await getSuperAdminUser(ctx);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.patch(args.userId, { status: args.status });
  },
});
export const remove = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await getSuperAdminUser(ctx);
    if (admin._id === args.userId) {
      throw new ConvexError("You cannot delete yourself.");
    }

    // Cleanup associated data
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    const pushSubs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const sub of pushSubs) {
      await ctx.db.delete(sub._id);
    }

    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const delivery of deliveries) {
      await ctx.db.delete(delivery._id);
    }

    await ctx.db.delete(args.userId);
  },
});

export const countActive = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    const users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    return users.length;
  },
});
