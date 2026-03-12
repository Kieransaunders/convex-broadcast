import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins";
import { components, internal } from "./_generated/api";
import betterAuthSchema from "./betterAuth/schema";
import { query, type QueryCtx } from "./_generated/server";
import type { DataModel, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import authConfig from "./auth.config";

export const authComponent: ReturnType<
  typeof createClient<DataModel, typeof betterAuthSchema>
> = createClient<DataModel, typeof betterAuthSchema>(components.betterAuth, {
  authFunctions: internal.auth,
  local: { schema: betterAuthSchema },
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL as
          | string
          | undefined;

        // Check for pending invite with matching email
        const pendingInvite = await ctx.db
          .query("invites")
          .withIndex("by_email", (q) => q.eq("email", authUser.email))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .unique();

        // Check if this is the first user (bootstrap scenario)
        const existingUsers = await ctx.db.query("users").take(1);
        const isFirstUser = existingUsers.length === 0;

        let role: "member" | "admin" | "super_admin";

        if (authUser.email === superAdminEmail) {
          role = "super_admin";
        } else if (pendingInvite) {
          // Use the role from the invite
          role = pendingInvite.role;
          // Mark invite as accepted
          await ctx.db.patch(pendingInvite._id, { status: "accepted" });
        } else if (isFirstUser) {
          // First user to sign up becomes super_admin automatically
          role = "super_admin";
        } else {
          role = "member";
        }

        const userId = await ctx.db.insert("users", {
          email: authUser.email,
          name: authUser.name ?? authUser.email,
          role,
          status: "active",
          createdAt: Date.now(),
        });
        await authComponent.setUserId(ctx, authUser._id, userId);
      },
      onDelete: async (ctx, authUser) => {
        const user = await ctx.db.get(authUser.userId as Id<"users">);
        if (user) await ctx.db.delete(user._id);
      },
    },
  },
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
export const { getAuthUser } = authComponent.clientApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    baseURL: process.env.SITE_URL as string | undefined,
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true },
    account: { accountLinking: { enabled: true } },
    plugins: [convex({ authConfig }), admin()],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

export const getUser = async (ctx: QueryCtx) => {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) throw new ConvexError("Unauthenticated");
  const user = await ctx.db.get(authUser.userId as Id<"users">);
  if (!user) throw new ConvexError("User not found");
  return user;
};

export const getAdminUser = async (ctx: QueryCtx) => {
  const user = await getUser(ctx);
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new ConvexError("Unauthorized: admin access required");
  }
  return user;
};

export const getSuperAdminUser = async (ctx: QueryCtx) => {
  const user = await getUser(ctx);
  if (user.role !== "super_admin") {
    throw new ConvexError("Unauthorized: super admin access required");
  }
  return user;
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return null;
    return await ctx.db.get(authUser.userId as Id<"users">);
  },
});
