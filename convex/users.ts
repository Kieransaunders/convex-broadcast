import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAdminUser, getSuperAdminUser, getUser } from "./auth";
import { components } from "./_generated/api";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    const users = await ctx.db.query("users").collect();
    
    // Supplement with authUserId if missing (for legacy users)
    return await Promise.all(users.map(async (user) => {
      if (user.authUserId) return user;
      
      const authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "userId", value: user._id }]
      });
      
      if (authUser) {
        return { ...user, authUserId: authUser._id };
      }
      return user;
    }));
  },
});

export const search = query({
  args: {
    query: v.string(),
    role: v.optional(
      v.union(
        v.literal("member"),
        v.literal("admin"),
        v.literal("super_admin"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const q = ctx.db
      .query("users")
      .withSearchIndex("search_name_email", (s) => {
        let searchQuery = s.search("name", args.query);
        if (args.role) {
          searchQuery = searchQuery.eq("role", args.role);
        }
        return searchQuery;
      });
    return await q.take(50);
  },
});

export const getById = query({
  args: { id: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    await getUser(ctx);
    return await ctx.db.get("users", args.id);
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
    await ctx.db.patch("users", args.userId, { role: args.role });

    // Synchronize role to Better Auth
    const authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "userId", value: args.userId }],
    });

    if (authUser) {
      await ctx.runMutation(components.betterAuth.adapter.updateOne, {
        input: {
          model: "user",
          where: [{ field: "_id", value: authUser._id }],
          update: { role: args.role },
        },
      });
      
      // Also ensure project user has authUserId cached
      await ctx.db.patch("users", args.userId, { authUserId: authUser._id });
    }
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.patch("users", args.userId, { status: args.status });
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
      await ctx.db.delete("groupMemberships", membership._id);
    }

    const pushSubs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const sub of pushSubs) {
      await ctx.db.delete("pushSubscriptions", sub._id);
    }

    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const delivery of deliveries) {
      await ctx.db.delete("deliveries", delivery._id);
    }

    await ctx.db.delete("users", args.userId);
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
