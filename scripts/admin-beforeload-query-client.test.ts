import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const adminRoute = readFileSync("src/routes/_authed/_admin.tsx", "utf8");

assert.ok(
  adminRoute.includes("const { queryClient } = context as any;"),
  "admin beforeLoad should read the TanStack queryClient from router context",
);

assert.ok(
  adminRoute.includes("await queryClient.fetchQuery("),
  "admin beforeLoad should fetch through queryClient.fetchQuery",
);

assert.ok(
  !adminRoute.includes("convexQueryClient.fetchQuery"),
  "admin beforeLoad must not call fetchQuery on ConvexQueryClient",
);

console.log("admin beforeLoad query client test passed");
