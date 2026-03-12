# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Organisation Communications PWA** — a boilerplate for single-organisation broadcast messaging apps. Admins send targeted messages (by group or event audience) to members via in-app feed and browser push notifications. One deployment = one organisation; no multi-tenant architecture.

Tech stack: React 19 + TanStack Start + Convex backend + Better Auth + Tailwind v4 + shadcn/ui + PWA push notifications.

## Commands

```bash
# Start development (runs convex deploy once, then starts both web + convex watchers)
npm run dev

# Web frontend only
npm run dev:web

# Convex backend only
npm run dev:convex

# Build
npm run build

# Lint (TypeScript + ESLint, 0 warnings allowed)
npm run lint

# Format
npm run format
```

Dev server runs at `http://localhost:3000`.

## Environment Setup

Copy `.env.example` to `.env.local`. Required vars:
- `VITE_CONVEX_URL` — from Convex dashboard
- `VITE_CONVEX_SITE_URL` — from Convex dashboard

Set these in the **Convex dashboard** (`npx convex env set`):
- `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
- `SITE_URL` — e.g. `http://localhost:3000`
- `SUPER_ADMIN_EMAIL` — first super admin

Optional (push notifications):
- `VITE_VAPID_PUBLIC_KEY` + `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` — generate with `npx web-push generate-vapid-keys`
- `RESEND_API_KEY` — for email invites

## Architecture

### Frontend (TanStack Start + Router)

File-based routing in `src/routes/`:
- `__root.tsx` — root layout, sets up `ConvexBetterAuthProvider`, registers service worker, renders `ImpersonationBanner` + `PWAInstallPrompt`
- `_authed.tsx` — auth guard (redirects to `/sign-in` if no token)
- `_authed/_admin.tsx` — admin role guard
- `_authed/feed.tsx` — member message feed
- `_authed/_admin/` — admin dashboard, messages, groups, events, users, system-settings

Auth flows via `~/lib/auth-client.tsx` (Better Auth client with `convexClient()` and `adminClient()` plugins). Server-side token retrieval in `~/lib/auth-server.ts`.

Query layer uses `@convex-dev/react-query` — wraps Convex queries in TanStack Query via `convexQuery(api.module.fn, args)`.

### Backend (Convex)

All backend logic in `convex/`. Auto-generated types in `convex/_generated/api.d.ts` — never edit manually.

Key modules:
- `schema.ts` — full DB schema (users, groups, groupMemberships, events, messages, messageTargets, deliveries, invites, impersonationLogs, pushSubscriptions, settings)
- `messages.ts` — message CRUD, send/schedule logic
- `push.ts` / `pushActions.ts` — web push subscription management and delivery
- `users.ts` / `invites.ts` — user management, invite flow
- `groups.ts` / `events.ts` — group and event management
- `impersonation.ts` — admin impersonation with audit logging
- `crons.ts` — scheduled message processing
- `email.ts` — Resend email integration
- `http.ts` — HTTP action routes (Better Auth endpoints)
- `auth.ts` / `auth.config.ts` — Better Auth Convex integration
- `convex.config.ts` — registers `betterAuth` and `resend` Convex components

### Roles

Three roles: `member`, `admin`, `super_admin`. Role stored on the `users` table. Better Auth admin plugin handles role management.

### PWA

Service worker at `public/sw.js`. Manifest at `public/manifest.json`. Push notification subscription stored in `pushSubscriptions` table with preference (`all` | `urgent` | `none`).

## Key Conventions

- Sent messages are **immutable** — corrections require a new message
- Impersonation sessions are logged in `impersonationLogs` and visually indicated via `ImpersonationBanner`
- Message scheduling uses Convex's `_scheduled_functions` — `scheduledFunctionId` stored on the message
- All timestamps are Unix milliseconds (`.number()` in schema)
- UI components are shadcn/ui in `src/components/ui/` — add new ones with `npx shadcn add <component>`
- Tailwind v4 — uses CSS-first configuration in `src/styles/app.css`, not `tailwind.config.js`
