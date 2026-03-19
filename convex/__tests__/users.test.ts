import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

test("remove throws when unauthenticated", async () => {
  // Seed a user to provide a valid-looking ID for the arg
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "user@example.com",
      name: "Test User",
      role: "member",
      status: "active",
      authUserId: "auth_remove_001",
      createdAt: Date.now(),
    });
  });

  await expect(t.mutation(api.users.remove, { userId })).rejects.toThrow();
});

test("updateStatus throws when unauthenticated", async () => {
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "user2@example.com",
      name: "Test User 2",
      role: "member",
      status: "active",
      authUserId: "auth_status_001",
      createdAt: Date.now(),
    });
  });

  await expect(
    t.mutation(api.users.updateStatus, { userId, status: "inactive" }),
  ).rejects.toThrow();
});

test("countActive throws when unauthenticated", async () => {
  await expect(t.query(api.users.countActive, {})).rejects.toThrow();
});
