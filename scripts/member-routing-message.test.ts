import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const signInRoute = readFileSync("src/routes/sign-in.tsx", "utf8");
const signUpRoute = readFileSync("src/routes/sign-up.tsx", "utf8");
// Component logic (notices, search params) lives in the lazy split file
const inboxRoute = readFileSync("src/routes/_authed/inbox.lazy.tsx", "utf8");
const adminRoute = readFileSync("src/routes/_authed/_admin.tsx", "utf8");

assert.ok(
  !signInRoute.includes('router.navigate({ to: "/dashboard" })'),
  "sign-in should not send all users to /dashboard",
);

assert.ok(
  !signUpRoute.includes('router.navigate({ to: "/dashboard" })'),
  "sign-up should not send all users to /dashboard",
);

assert.ok(
  inboxRoute.includes("admin_only"),
  "inbox should handle an admin_only notice",
);

assert.ok(
  adminRoute.includes('to: "/inbox"') && adminRoute.includes("admin_only"),
  "admin route should redirect members to /inbox with an admin_only notice",
);

console.log("member routing message test passed");
