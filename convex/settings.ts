import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getSuperAdminUser } from "./auth"

export const getSet = query({
    args: { keys: v.array(v.string()) },
    handler: async (ctx, args) => {
        const settings = await Promise.all(
            args.keys.map(async (key) => {
                const setting = await ctx.db
                    .query("settings")
                    .withIndex("by_key", (q) => q.eq("key", key))
                    .unique()
                return { key, value: setting?.value ?? null }
            })
        )
        return settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
    },
})

export const update = mutation({
    args: {
        key: v.string(),
        value: v.any(),
    },
    handler: async (ctx, args) => {
        const user = await getSuperAdminUser(ctx)
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique()

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: args.value,
                updatedBy: user._id,
                updatedAt: Date.now(),
            })
        } else {
            await ctx.db.insert("settings", {
                key: args.key,
                value: args.value,
                description: "", // Can be expanded later
                updatedBy: user._id,
                updatedAt: Date.now(),
            })
        }
    },
})

export const getSetting = async (ctx: any, key: string, defaultValue: any) => {
    const setting = await ctx.db
        .query("settings")
        .withIndex("by_key", (q: any) => q.eq("key", key))
        .unique()
    return setting?.value ?? defaultValue
}
