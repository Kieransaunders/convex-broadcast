import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import * as React from "react";
import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { createServerFn } from "@tanstack/react-start";
import { authClient } from "~/lib/auth-client";
import { getToken } from "~/lib/auth-server";

import { ImpersonationBanner } from "~/components/impersonation-banner";
import appCss from "~/styles/app.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(async () => {
  return await getToken();
});

// Client-side token cache — avoids a server round-trip on every navigation.
// Cleared on sign-out so the next auth check fetches a fresh token.
let _tokenCache: string | null = null;

async function getCachedAuth(): Promise<string | null> {
  if (_tokenCache !== null) return _tokenCache;
  _tokenCache = await getAuth();
  return _tokenCache;
}

export function clearTokenCache() {
  _tokenCache = null;
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  beforeLoad: async ({ context }) => {
    (context.convexQueryClient.convexClient as any).setAuth(async () => {
      return await getCachedAuth();
    });
    return { token: await getCachedAuth() };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Org Comms",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
      },
      // System font fallback to prevent FOIT (Flash of Invisible Text)
      {
        rel: "preload",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
        as: "style",
      },
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
});

function RootComponent() {
  const { convexQueryClient } = Route.useRouteContext();

  // App name is loaded with a default - no blocking query needed
  // Settings can be loaded later by specific routes that need them
  // appName defaults to "Org Comms" and could be loaded dynamically by routes that need it

  // Dismiss loading screen once app is hydrated
  useEffect(() => {
    const loader = document.getElementById("app-loading");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 200);
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered, scope:", registration.scope);
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    }
  }, []);

  return (
    <RootDocument>
      <ConvexBetterAuthProvider
        client={convexQueryClient.convexClient}
        authClient={authClient}
      >
        <Outlet />
        <ImpersonationBanner />
        <PWAInstallPrompt />
      </ConvexBetterAuthProvider>
    </RootDocument>
  );
}

import { PWAInstallPrompt } from "~/components/pwa-install-prompt";

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body style={{ backgroundColor: "#f5f3ff", margin: 0 }}>
        <div
          id="app-loading"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f3ff",
            zIndex: 9999,
            transition: "opacity 0.2s ease-out",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #e0e0ef",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          <style
            dangerouslySetInnerHTML={{
              __html: "@keyframes spin{to{transform:rotate(360deg)}}",
            }}
          />
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
