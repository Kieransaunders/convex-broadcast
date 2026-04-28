import { betterAuth } from "better-auth/minimal";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins";
import { ConvexError } from "convex/values";
import { components, internal } from "./_generated/api";
import betterAuthSchema from "./betterAuth/schema";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { resolveProjectUserLink } from "./auth-linking";
import type { Doc, DataModel, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { BetterAuthOptions } from "better-auth/minimal";

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
          await ctx.db.patch("invites", pendingInvite._id, {
            status: "accepted",
          });
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
    trustedOrigins: process.env.SITE_URL ? [process.env.SITE_URL] : [],
    secret: process.env.BETTER_AUTH_SECRET,
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

type AuthComponentUser = NonNullable<
  Awaited<ReturnType<typeof authComponent.safeGetAuthUser>>
>;
type AuthCtx = QueryCtx | MutationCtx;

const isMutationCtx = (ctx: AuthCtx): ctx is MutationCtx =>
  "runMutation" in ctx;

const repairUserLink = async (
  ctx: MutationCtx,
  authUser: AuthComponentUser,
  user: Doc<"users">,
) => {
  await authComponent.setUserId(ctx, authUser._id, user._id);
  if (user.authUserId !== authUser._id) {
    await ctx.db.patch("users", user._id, { authUserId: authUser._id });
  }
};

const resolveProjectUser = async (
  ctx: AuthCtx,
  authUser: AuthComponentUser,
) => {
  const result = await resolveProjectUserLink({
    authUser: {
      authRecordId: authUser._id,
      linkedUserId: authUser.userId ?? null,
      email: authUser.email ?? null,
    },
    getById: async (id) => {
      return await ctx.db.get("users", id as Id<"users">);
    },
    getByEmail: async (email) => {
      return await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .unique();
    },
    getUserId: (user) => user._id,
    getUserAuthRecordId: (user) => user.authUserId,
  });

  if (result.user && result.needsRepair && isMutationCtx(ctx)) {
    await repairUserLink(ctx, authUser, result.user);
  }

  return result.user;
};

export const getUser = async (ctx: AuthCtx) => {
  try {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new ConvexError("Unauthenticated");
    const user = await resolveProjectUser(ctx, authUser);
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
export const safeGetUser = async (ctx: AuthCtx) => {
  let authUser;
  try {
    authUser = await authComponent.safeGetAuthUser(ctx);
  } catch {
    return null;
  }
  if (!authUser) return null;
  return resolveProjectUser(ctx, authUser);
};

export const getAdminUser = async (ctx: AuthCtx) => {
  const user = await getUser(ctx);
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new ConvexError("Unauthorized: admin access required");
  }
  return user;
};

export const getSuperAdminUser = async (ctx: AuthCtx) => {
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
    return await resolveProjectUser(ctx, authUser);
  },
});
