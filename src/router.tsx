import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider } from "convex/react";

import { routeTree } from "./routeTree.gen";

// On the server there is no WebSocket global, so we pass a no-op stub to satisfy
// the ConvexReactClient constructor check. The ConvexQueryClient will use its
// ConvexHttpClient for all SSR queries anyway.
const isServer = typeof window === "undefined";
class NoopWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = NoopWebSocket.CLOSED;
  addEventListener() {}
  removeEventListener() {}
  close() {}
  send() {}
}

export function getRouter() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    console.error("missing envar CONVEX_URL");
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL, {
    ...(isServer && { webSocketConstructor: NoopWebSocket as unknown as typeof WebSocket }),
    expectAuth: true,
  });

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 30, // 30 seconds
        refetchOnWindowFocus: false,
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent', // Preload routes on hover/focus for instant navigation
      defaultPreloadDelay: 100, // Small delay to avoid unnecessary preloads
      context: { queryClient, convexQueryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 30_000, // 30 second stale time for preloads
      defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
      defaultNotFoundComponent: () => <p>not found</p>,
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
          {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </ConvexProvider>
      ),
    }),
    queryClient,
  );

  return router;
}
