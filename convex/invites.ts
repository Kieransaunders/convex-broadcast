import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAdminUser } from "./auth";
import { resend } from "./email";
import { getSetting } from "./settings";

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    return await ctx.db
      .query("invites")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const admin = await getAdminUser(ctx);
    const existing = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();
    if (existing) return existing._id;

    const inviteId = await ctx.db.insert("invites", {
      email: args.email,
      role: args.role,
      expiresAt: Date.now() + INVITE_EXPIRY_MS,
      invitedBy: admin._id,
      status: "pending",
      createdAt: Date.now(),
    });

    // Use dynamic settings for email
    const fromEmail = await getSetting(
      ctx,
      "sender_email",
      "noreply@orgcomms.app",
    );
    const appName = await getSetting(ctx, "app_name", "Org Comms");
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";

    console.log(
      `Sending invite email to ${args.email} via Resend (From: ${fromEmail})...`,
    );
    try {
      const result = await resend.sendEmail(ctx, {
        from: `${appName} <${fromEmail}>`,
        to: args.email,
        subject: `You've been invited to join ${appName}`,
        html: `<p>You've been invited to join the organisation. <a href="${siteUrl}/sign-up?invite=${inviteId}">Accept invite</a></p>`,
      });
      console.log("Resend email sent successfully:", result);
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      // We don't throw here to avoid failing the mutation, but we log it
    }

    return inviteId;
  },
});

export const revoke = mutation({
  args: { id: v.id("invites") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.patch("invites", args.id, { status: "expired" });
  },
});

// Mark invite as accepted (useful when user signed up before auto-accept was implemented)
export const markAccepted = mutation({
  args: { id: v.id("invites") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.patch("invites", args.id, { status: "accepted" });
  },
});

// List pending invites that don't have a matching user yet
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    const pendingInvites = await ctx.db
      .query("invites")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Get all users to check which invites have matching users
    const users = await ctx.db.query("users").collect();
    const userEmails = new Set(users.map((u) => u.email.toLowerCase()));

    // Filter out invites where user already exists
    return pendingInvites.filter(
      (invite) => !userEmails.has(invite.email.toLowerCase()),
    );
  },
});
