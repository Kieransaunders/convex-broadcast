import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

test("list throws when unauthenticated", async () => {
  await expect(t.query(api.invites.list, {})).rejects.toThrow();
});

test("create throws when unauthenticated", async () => {
  await expect(
    t.mutation(api.invites.create, {
      email: "newuser@example.com",
      role: "member",
    }),
  ).rejects.toThrow();
});
