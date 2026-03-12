import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { components } from "./_generated/api";

export const inspectEmail = internalQuery({
  args: { email: v.string() },
  returns: v.object({
    email: v.string(),
    betterAuthUserId: v.union(v.null(), v.string()),
    betterAuthLinkedUserId: v.union(v.null(), v.string()),
    appUserId: v.union(v.null(), v.id("users")),
    appUserRole: v.union(
      v.null(),
      v.union(
        v.literal("member"),
        v.literal("admin"),
        v.literal("super_admin"),
      ),
    ),
  }),
  handler: async (ctx, args) => {
    const betterAuthUser = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "user",
        where: [{ field: "email", value: args.email }],
      },
    );

    const appUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    return {
      email: args.email,
      betterAuthUserId: betterAuthUser?._id ?? null,
      betterAuthLinkedUserId: betterAuthUser?.userId ?? null,
      appUserId: appUser?._id ?? null,
      appUserRole: appUser?.role ?? null,
    };
  },
});

export const repairEmail = internalMutation({
  args: { email: v.string() },
  returns: v.object({
    email: v.string(),
    betterAuthUserId: v.string(),
    appUserId: v.id("users"),
    role: v.union(
      v.literal("member"),
      v.literal("admin"),
      v.literal("super_admin"),
    ),
    repaired: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const betterAuthUser = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "user",
        where: [{ field: "email", value: args.email }],
      },
    );

    if (!betterAuthUser?._id) {
      throw new Error(`No Better Auth user found for ${args.email}`);
    }

    const existingAppUserByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingAppUserByEmail) {
      await ctx.runMutation(components.betterAuth.adapter.updateOne, {
        input: {
          model: "user",
          where: [{ field: "_id", value: betterAuthUser._id }],
          update: { userId: existingAppUserByEmail._id },
        },
      });

      return {
        email: args.email,
        betterAuthUserId: betterAuthUser._id,
        appUserId: existingAppUserByEmail._id,
        role: existingAppUserByEmail.role,
        repaired: false,
      };
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL as string | undefined;
    const role =
      args.email === superAdminEmail
        ? ("super_admin" as const)
        : ("member" as const);

    const appUserId = await ctx.db.insert("users", {
      email: args.email,
      name: betterAuthUser.name ?? args.email,
      role,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "user",
        where: [{ field: "_id", value: betterAuthUser._id }],
        update: { userId: appUserId },
      },
    });

    return {
      email: args.email,
      betterAuthUserId: betterAuthUser._id,
      appUserId,
      role,
      repaired: true,
    };
  },
});
