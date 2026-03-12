import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start"
import { resolveAuthServerEnv } from "./auth-env"

const { convexUrl, convexSiteUrl } = resolveAuthServerEnv(
  process.env,
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env,
)

export const { handler, getToken } = convexBetterAuthReactStart({
  convexUrl,
  convexSiteUrl,
})
