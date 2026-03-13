import { cronJobs } from "convex/server";
import { components, internal } from "./_generated/api.js";
import { internalMutation } from "./_generated/server.js";

const DEMO_EMAIL = "demo@orgcomms.test";

const crons = cronJobs();
crons.interval("Remove old emails", { hours: 1 }, internal.crons.cleanupResend);
crons.interval("Cleanup demo messages", { hours: 2 }, internal.crons.cleanupDemoMessages);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
      olderThan: ONE_WEEK_MS,
    });
    await ctx.scheduler.runAfter(
      0,
      components.resend.lib.cleanupAbandonedEmails,
      {
        olderThan: 4 * ONE_WEEK_MS,
      },
    );
  },
});

export const cleanupDemoMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const demoUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", DEMO_EMAIL))
      .unique();
    if (!demoUser) return;

    // Get all messages created by the demo user
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", demoUser._id))
      .collect();

    for (const message of messages) {
      // Delete deliveries
      const deliveries = await ctx.db
        .query("deliveries")
        .withIndex("by_messageId", (q) => q.eq("messageId", message._id))
        .collect();
      for (const delivery of deliveries) {
        await ctx.db.delete(delivery._id);
      }

      // Delete message targets
      const targets = await ctx.db
        .query("messageTargets")
        .withIndex("by_messageId", (q) => q.eq("messageId", message._id))
        .collect();
      for (const target of targets) {
        await ctx.db.delete(target._id);
      }

      // Cancel any scheduled sends
      if (message.scheduledFunctionId) {
        try {
          await ctx.scheduler.cancel(message.scheduledFunctionId);
        } catch {
          // Already executed or cancelled
        }
      }

      // Delete the message
      await ctx.db.delete(message._id);
    }
  },
});

export default crons;
