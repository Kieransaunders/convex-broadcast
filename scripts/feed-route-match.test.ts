import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const feedRoute = readFileSync("src/routes/_authed/feed.tsx", "utf8")

assert.ok(
  feedRoute.includes('useSearch({ from: "/_authed/feed" })'),
  "feed route should read search params from the file-route id to avoid active-match invariant failures",
)

console.log("feed route match test passed")
