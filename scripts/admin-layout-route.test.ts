import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

assert.ok(
  !existsSync("src/routes/_authed/_admin/layout.tsx"),
  "admin shell should live on the _admin route, not on a separate /layout route",
);

const adminRoute = readFileSync("src/routes/_authed/_admin.tsx", "utf8");

assert.ok(
  adminRoute.includes("SidebarProvider"),
  "the _admin route should own the admin shell so child routes render inside it",
);

console.log("admin layout route test passed");
