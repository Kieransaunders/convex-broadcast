import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const inboxRoute = readFileSync("src/routes/_authed/inbox.tsx", "utf8");

assert.ok(
  inboxRoute.includes('useSearch({ from: "/_authed/inbox" })'),
  "inbox route should read search params from the file-route id to avoid active-match invariant failures",
);

console.log("inbox route match test passed");
