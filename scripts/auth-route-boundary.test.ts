import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const authedRoute = readFileSync("src/routes/_authed.tsx", "utf8")

assert.ok(
  !authedRoute.includes('import { getToken } from "~/lib/auth-server"'),
  "shared route modules must not import ~/lib/auth-server directly",
)

console.log("auth route boundary test passed")
