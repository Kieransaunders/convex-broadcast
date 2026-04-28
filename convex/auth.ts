import {  betterAuth } from "better-auth/minimal";
import {  createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins";
import { ConvexError } from "convex/values";
import { components, internal } from "./_generated/api";
import betterAuthSchema from "./betterAuth/schema";
import {  query } from "./_generated/server";
import authConfig from "./auth.config";
import type {QueryCtx} from "./_generated/server";
import type {GenericCtx} from "@convex-dev/better-auth";
import type {BetterAuthOptions} from "better-auth/minimal";
import type { DataModel, Id } from "./_generated/dataModel";

export const authComponent: ReturnType<
  typeof createClient<DataModel, typeof betterAuthSchema>
> = createClient<DataModel, typeof betterAuthSchema>(components.betterAuth, {
  authFunctions: internal.auth,
  local: { schema: betterAuthSchema },
  verbose: true,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

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
          await ctx.db.patch("invites", pendingInvite._id, { status: "accepted" });
        } else if (isFirstUser) {
          // First user to sign up becomes super_admin automatically
          role = "super_admin";
        } else {
          role = "member";
        }

        const userId = await ctx.db.insert("users", {
          email: authUser.email,
          name: authUser.name,
          role,
          status: "active",
          authUserId: authUser._id,
          createdAt: Date.now(),
        });
        await authComponent.setUserId(ctx, authUser._id, userId);
        
        // Synchronize role to Better Auth user record for admin plugin
        // Better Auth uses its own 'user' table (singular)
        await ctx.runMutation(components.betterAuth.adapter.updateOne, {
          input: {
            model: "user",
            where: [{ field: "_id", value: authUser._id }],
            update: { role },
          },
        });
      },
      onDelete: async (ctx, authUser) => {
        const user = await ctx.db.get("users", authUser.userId as Id<"users">);
        if (user) await ctx.db.delete("users", user._id);
      },
    },
  },
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
export const { getAuthUser } = authComponent.clientApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: process.env.SITE_URL ? [process.env.SITE_URL] : [],
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true },
    account: { accountLinking: { enabled: true } },
    plugins: [
      convex({ authConfig, jwksRotateOnTokenGenerationError: true }),
      admin({
        ac: ((ac: any) => {
          const adminAc = ac.roles.admin;
          return {
            super_admin: ac.newRole({
              ...adminAc.statements,
              user: ["impersonate-admins", ...adminAc.statements.user],
            }),
          };
        }) as any,
      }),
    ],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

export const getUser = async (ctx: QueryCtx) => {
  try {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new ConvexError("Unauthenticated");
    if (!authUser.userId) {
      throw new ConvexError("User session found but not linked to a project user record");
    }
    const user = await ctx.db.get("users", authUser.userId as Id<"users">);
    if (!user) throw new ConvexError("User not found in project database");
    return user;
  } catch (error) {
    if (error instanceof ConvexError) throw error;
    console.error("Auth error:", error);
    throw new ConvexError("Authentication system error");
  }
};

// Returns null instead of throwing — use for queries that should return empty data
// during the brief auth initialization window (hydration race with ConvexBetterAuthProvider).
export const safeGetUser = async (ctx: QueryCtx) => {
  let authUser;
  try {
    authUser = await authComponent.safeGetAuthUser(ctx);
  } catch {
    return null;
  }
  if (!authUser?.userId) return null;
  return ctx.db.get("users", authUser.userId as Id<"users">);
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
    return await ctx.db.get("users", authUser.userId as Id<"users">);
  },
});
