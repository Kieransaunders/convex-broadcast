import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

assert.ok(
  !existsSync("src/routes/_authed/_admin/layout.tsx"),
  "admin shell should live on the _admin route, not on a separate /layout route",
);

const adminRoute = readFileSync("src/routes/_authed/_admin.tsx", "utf8");
const adminLazyRoute = readFileSync("src/routes/_authed/_admin.lazy.tsx", "utf8");

assert.ok(
  !adminRoute.includes("component:"),
  "the _admin route config should keep critical config only and load the shell from the lazy route",
);

assert.ok(
  adminLazyRoute.includes('createLazyFileRoute("/_authed/_admin")'),
  "the admin shell should be provided by an explicit lazy route for /_authed/_admin",
);

assert.ok(
  adminLazyRoute.includes("SidebarProvider"),
  "the explicit lazy admin route should own the admin shell so child routes render inside it",
);

console.log("admin layout route test passed");
