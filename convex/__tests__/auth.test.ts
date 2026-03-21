/**
 * Auth module unit tests.
 *
 * NOTE: Authenticated scenarios (e.g. "admin only" queries) are not tested here
 * because convex-test's t.withIdentity() only sets ctx.auth.getUserIdentity() —
 * it does not seed the betterAuth component's session tables that
 * authComponent.safeGetAuthUser() depends on. Until a helper exists to bootstrap
 * that state, we test only the unauthenticated paths, which are the most valuable
 * regression tests for the hydration-race fix.
 */

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------

test("getCurrentUser returns null when unauthenticated", async () => {
  const result = await t.query(api.auth.getCurrentUser, {});
  expect(result).toBeNull();
});

// ---------------------------------------------------------------------------
// feed (regression test for hydration race fix)
// ---------------------------------------------------------------------------

test("feed returns empty paginated result when unauthenticated", async () => {
  // KEY regression test: the feed query must return an empty paginated result
  // — not throw — when called before the auth session is established (the
  // hydration race window on the client). This was the bug fixed in
  // "fix: return empty feed gracefully during auth hydration race".
  const result = await t.query(api.messages.feed, {});
  expect(result).toEqual({ items: [], cursor: null, hasMore: false });
});

// ---------------------------------------------------------------------------
// dashboardStats
// ---------------------------------------------------------------------------

test("dashboardStats returns null when called unauthenticated", async () => {
  // dashboardStats uses safeGetUser so it returns null during the auth
  // hydration race rather than throwing, matching the pattern used by
  // feed/unreadCount.
  const result = await t.query(api.messages.dashboardStats, {});
  expect(result).toBeNull();
});
