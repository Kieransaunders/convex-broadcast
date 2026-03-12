type EnvMap = Record<string, string | undefined>

const getRequiredEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`${name} is not set for auth server configuration`)
  }

  return value
}

export function resolveAuthServerEnv(
  env: EnvMap,
  viteEnv?: EnvMap,
): { convexUrl: string; convexSiteUrl: string } {
  const convexUrl =
    env.CONVEX_URL ??
    env.VITE_CONVEX_URL ??
    viteEnv?.CONVEX_URL ??
    viteEnv?.VITE_CONVEX_URL

  const convexSiteUrl =
    env.CONVEX_SITE_URL ??
    env.VITE_CONVEX_SITE_URL ??
    viteEnv?.CONVEX_SITE_URL ??
    viteEnv?.VITE_CONVEX_SITE_URL

  return {
    convexUrl: getRequiredEnv("CONVEX_URL", convexUrl),
    convexSiteUrl: getRequiredEnv("CONVEX_SITE_URL", convexSiteUrl),
  }
}
