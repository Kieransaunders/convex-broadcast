import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

test("list returns empty array when unauthenticated", async () => {
  const result = await t.query(api.groups.list, {});
  expect(result).toEqual([]);
});

test("create throws when unauthenticated", async () => {
  await expect(
    t.mutation(api.groups.create, {
      name: "Test Group",
      description: "A test group",
    }),
  ).rejects.toThrow();
});

test("groups table: active flag works", async () => {
  await t.run(async (ctx) => {
    const createdBy = await ctx.db.insert("users", {
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      status: "active",
      authUserId: "auth_seed_001",
      createdAt: Date.now(),
    });

    await ctx.db.insert("groups", {
      name: "Active Group",
      description: "This group is active",
      active: true,
      createdBy,
      createdAt: Date.now(),
    });

    await ctx.db.insert("groups", {
      name: "Inactive Group",
      description: "This group is inactive",
      active: false,
      createdBy,
      createdAt: Date.now(),
    });
  });

  const allGroups = await t.run(async (ctx) => {
    return await ctx.db.query("groups").collect();
  });

  expect(allGroups).toHaveLength(2);

  const activeGroups = allGroups.filter((g) => g.active === true);
  const inactiveGroups = allGroups.filter((g) => g.active === false);

  expect(activeGroups).toHaveLength(1);
  expect(activeGroups[0].name).toBe("Active Group");

  expect(inactiveGroups).toHaveLength(1);
  expect(inactiveGroups[0].name).toBe("Inactive Group");
});
