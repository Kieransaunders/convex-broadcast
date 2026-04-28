import { createServerFn } from "@tanstack/react-start";
import { getToken } from "~/lib/auth-server";

export const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  return (await getToken()) ?? null;
});

// Client-side token cache — avoids a server round-trip on every navigation.
// Cleared on sign-out so the next auth check fetches a fresh token.
let _tokenCache: string | null = null;

export async function getCachedAuth(): Promise<string | null> {
  if (typeof window === "undefined") {
    return (await getAuth()) ?? null;
  }
  if (_tokenCache !== null) return _tokenCache;
  _tokenCache = (await getAuth()) ?? null;
  return _tokenCache;
}

export function clearTokenCache() {
  _tokenCache = null;
}
