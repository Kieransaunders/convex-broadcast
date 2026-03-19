import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Component logic lives in the lazy file; the route definition file only has createFileRoute + loader.
const inboxLazy = readFileSync("src/routes/_authed/inbox.lazy.tsx", "utf8");

assert.ok(
  inboxLazy.includes('getRouteApi("/_authed/inbox")'),
  "inbox lazy component should read search params via getRouteApi to avoid active-match invariant failures",
);

console.log("inbox route match test passed");
