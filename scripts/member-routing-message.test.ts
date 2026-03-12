import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const signInRoute = readFileSync("src/routes/sign-in.tsx", "utf8");
const signUpRoute = readFileSync("src/routes/sign-up.tsx", "utf8");
const feedRoute = readFileSync("src/routes/_authed/feed.tsx", "utf8");
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
  feedRoute.includes("admin_only"),
  "feed should handle an admin_only notice",
);

assert.ok(
  adminRoute.includes('to: "/feed"') && adminRoute.includes("admin_only"),
  "admin route should redirect members to /feed with an admin_only notice",
);

console.log("member routing message test passed");
