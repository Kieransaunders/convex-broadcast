import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import * as React from "react";
import { useEffect } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import { authClient } from "~/lib/auth-client";
import { getCachedAuth } from "~/lib/auth-helpers";

import { ImpersonationBanner } from "~/components/impersonation-banner";
import appCss from "~/styles/app.css?url";

import { PWAInstallPrompt } from "~/components/pwa-install-prompt";
import { SWUpdatePrompt } from "~/components/sw-update-prompt";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  beforeLoad: async ({ context }) => {
    // Set the auth function on the Convex client lazily.
    // This function will only be executed when a Convex query/mutation is actually called.
    (context.convexQueryClient.convexClient as any).setAuth(async () => {
      return await getCachedAuth();
    });
    // NO BLOCKING AWAIT HERE - allows public pages to render immediately
    return {};
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
        title: "Org Comms | Internal Communication App for Organisations",
      },
      {
        name: "description",
        content:
          "Broadcast messages to members, staff, and volunteers with Org Comms, the internal communication app for organisations.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:title",
        content: "Org Comms | Internal Communication App for Organisations",
      },
      {
        property: "og:description",
        content:
          "Broadcast messages to members, staff, and volunteers with Org Comms, the internal communication app for organisations.",
      },
      { property: "og:site_name", content: "Org Comms" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Org Comms | Internal Communication App for Organisations",
      },
      {
        name: "twitter:description",
        content:
          "Broadcast messages to members, staff, and volunteers with Org Comms, the internal communication app for organisations.",
      },
      { name: "theme-color", content: "#6366F1" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://orgcomms.app" },
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
  const { queryClient, convexQueryClient } = Route.useRouteContext();

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
      <QueryClientProvider client={queryClient}>
        <ConvexBetterAuthProvider
          client={convexQueryClient.convexClient}
          authClient={authClient}
        >
          <Outlet />
          <ImpersonationBanner />
          <PWAInstallPrompt />
          <SWUpdatePrompt />
        </ConvexBetterAuthProvider>
      </QueryClientProvider>
    </RootDocument>
  );
}

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
