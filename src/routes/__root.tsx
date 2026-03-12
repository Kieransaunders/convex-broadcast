import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import { useEffect } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { createServerFn } from '@tanstack/react-start'
import { authClient } from '~/lib/auth-client'
import { getToken } from '~/lib/auth-server'
import { api } from '../../convex/_generated/api'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { ImpersonationBanner } from '~/components/impersonation-banner'
import appCss from '~/styles/app.css?url'

const getAuth = createServerFn({ method: 'GET' }).handler(async () => {
  return await getToken()
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}>()({
  beforeLoad: async ({ context }) => {
    ; (context.convexQueryClient.convexClient as any).setAuth(async () => {
      return await getAuth()
    })
    return { token: await getAuth() } // Keep returning token for consistency if needed elsewhere, or remove if not used.
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Org Comms',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  const { convexQueryClient } = Route.useRouteContext()

  const { data: settings } = useQuery(convexQuery(api.settings.getSet, { keys: ["app_name"] }))
  const appName = (settings as any)?.app_name || "Org Comms"

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }
  }, [])

  useEffect(() => {
    if (appName) {
      document.title = appName
    }
  }, [appName])

  return (
    <RootDocument>
      <ConvexBetterAuthProvider client={convexQueryClient.convexClient} authClient={authClient}>
        <Outlet />
        <ImpersonationBanner />
        <PWAInstallPrompt />
      </ConvexBetterAuthProvider>
    </RootDocument>
  )
}

import { PWAInstallPrompt } from '~/components/pwa-install-prompt'

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
