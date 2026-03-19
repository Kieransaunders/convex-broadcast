import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

test("getSet returns empty object for no keys", async () => {
  const result = await t.query(api.settings.getSet, { keys: [] });
  expect(result).toEqual({});
});

test("getSet returns null for missing keys", async () => {
  const result = await t.query(api.settings.getSet, { keys: ["nonexistent"] });
  expect(result).toEqual({ nonexistent: null });
});

test("getSet returns value for existing setting", async () => {
  await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      email: "admin@test.com",
      name: "Test Admin",
      role: "super_admin",
      status: "active",
      createdAt: Date.now(),
    });
    await ctx.db.insert("settings", {
      key: "app_name",
      value: "Test Org",
      description: "Application name",
      updatedBy: userId,
      updatedAt: Date.now(),
    });
  });

  const result = await t.query(api.settings.getSet, { keys: ["app_name"] });
  expect(result).toEqual({ app_name: "Test Org" });
});

test("update throws when unauthenticated", async () => {
  await expect(
    t.mutation(api.settings.update, { key: "app_name", value: "New Name" }),
  ).rejects.toThrow();
});
