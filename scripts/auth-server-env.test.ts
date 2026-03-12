import assert from "node:assert/strict"
import { resolveAuthServerEnv } from "../src/lib/auth-env"

const originalEnv = { ...process.env }

try {
  process.env = {
    ...originalEnv,
    VITE_CONVEX_URL: "https://example.convex.cloud",
    VITE_CONVEX_SITE_URL: "https://example.convex.site",
    CONVEX_URL: undefined,
    CONVEX_SITE_URL: undefined,
  }

  assert.deepEqual(resolveAuthServerEnv(process.env), {
    convexUrl: "https://example.convex.cloud",
    convexSiteUrl: "https://example.convex.site",
  })

  process.env = {
    ...originalEnv,
    VITE_CONVEX_URL: "https://wrong.convex.cloud",
    VITE_CONVEX_SITE_URL: "https://wrong.convex.site",
    CONVEX_URL: "https://right.convex.cloud",
    CONVEX_SITE_URL: "https://right.convex.site",
  }

  assert.deepEqual(resolveAuthServerEnv(process.env), {
    convexUrl: "https://right.convex.cloud",
    convexSiteUrl: "https://right.convex.site",
  })

  process.env = {
    ...originalEnv,
    VITE_CONVEX_URL: undefined,
    VITE_CONVEX_SITE_URL: undefined,
    CONVEX_URL: undefined,
    CONVEX_SITE_URL: undefined,
  }

  assert.deepEqual(
    resolveAuthServerEnv(process.env, {
      VITE_CONVEX_URL: "https://vite.convex.cloud",
      VITE_CONVEX_SITE_URL: "https://vite.convex.site",
    }),
    {
      convexUrl: "https://vite.convex.cloud",
      convexSiteUrl: "https://vite.convex.site",
    },
  )
} finally {
  process.env = originalEnv
}

console.log("auth env resolution tests passed")
