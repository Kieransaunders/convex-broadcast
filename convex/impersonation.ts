import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getAdminUser } from "./auth"

export const logStart = mutation({
  args: { impersonatedUserId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await getAdminUser(ctx)
    return await ctx.db.insert("impersonationLogs", {
      adminUserId: admin._id,
      impersonatedUserId: args.impersonatedUserId,
      startedAt: Date.now(),
    })
  },
})

export const logEnd = mutation({
  args: { logId: v.id("impersonationLogs") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx)
    await ctx.db.patch(args.logId, { endedAt: Date.now() })
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx)
    return await ctx.db.query("impersonationLogs").order("desc").take(100)
  },
})
