/**
 * Message module unit tests.
 *
 * NOTE: Tests requiring an authenticated admin session (create, sendNow, etc.)
 * are not covered here because convex-test's t.withIdentity() only populates
 * ctx.auth.getUserIdentity() and does not seed the betterAuth component's
 * session tables. The auth-dependent code paths require that component state
 * to resolve the app-level user record. Until a seeding helper exists, we
 * cover unauthenticated behaviour, which is the highest-value regression
 * surface area.
 */

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

// ---------------------------------------------------------------------------
// feed — unauthenticated (hydration-race regression)
// ---------------------------------------------------------------------------

test("feed returns empty array when unauthenticated", async () => {
  // Regression test: safeGetUser() returns null when unauthenticated, so feed
  // must short-circuit and return [] rather than throwing. This guards against
  // the auth hydration race on the client where the query fires before the
  // session is ready.
  const result = await t.query(api.messages.feed, {});
  expect(result).toEqual([]);
});

test("feed with filter returns empty array when unauthenticated", async () => {
  const resultUnread = await t.query(api.messages.feed, { filter: "unread" });
  expect(resultUnread).toEqual([]);

  const resultRead = await t.query(api.messages.feed, { filter: "read" });
  expect(resultRead).toEqual([]);
});

// ---------------------------------------------------------------------------
// unreadCount — unauthenticated
// ---------------------------------------------------------------------------

test("unreadCount returns 0 when unauthenticated", async () => {
  // unreadCount uses safeGetUser, so it returns 0 rather than throwing when
  // there is no authenticated session.
  const result = await t.query(api.messages.unreadCount, {});
  expect(result).toBe(0);
});

// ---------------------------------------------------------------------------
// markAllAsRead — unauthenticated
// ---------------------------------------------------------------------------

test("markAllAsRead throws when unauthenticated", async () => {
  // markAllAsRead uses getUser (strict), so it must throw for unauthenticated
  // callers.
  await expect(t.mutation(api.messages.markAllAsRead, {})).rejects.toThrow(
    "Unauthenticated",
  );
});

// ---------------------------------------------------------------------------
// create — unauthenticated
// ---------------------------------------------------------------------------

test("create throws when unauthenticated", async () => {
  await expect(
    t.mutation(api.messages.create, {
      title: "Test",
      body: "Test body",
      category: "notice",
      audienceType: "all",
      pushEnabled: false,
    }),
  ).rejects.toThrow("Unauthenticated");
});

// ---------------------------------------------------------------------------
// dashboardStats — unauthenticated
// ---------------------------------------------------------------------------

test("dashboardStats throws when unauthenticated", async () => {
  await expect(t.query(api.messages.dashboardStats, {})).rejects.toThrow(
    "Unauthenticated",
  );
});
