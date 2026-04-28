# Org Comms - Organisation Communications PWA

## Project Overview

Org Comms is a **single-organisation communication Progressive Web App (PWA)** designed for broadcast messaging from administrators to members. It serves as an open-source boilerplate for building internal communication apps such as:

- Charity volunteer coordination
- Staff internal communications
- University course announcements
- Community group updates
- Member organisation portals

The system focuses on **admin-led broadcast messaging with audience targeting** rather than chat or social interaction.

### Core Design Principles

1. **Single Organisation Model**: One organisation per deployment, no multi-tenancy
2. **Broadcast Communication First**: One-way communication from admins to members
3. **Simple Roles**: Minimal role system (member, admin, super_admin)
4. **PWA Notification Delivery**: Messages appear in-app and as push notifications
5. **Admin-Centric Control**: Administrators manage users, groups, events, messages, and scheduling

---

## Technology Stack

| Layer                  | Technology                                                      |
| ---------------------- | --------------------------------------------------------------- |
| **Frontend Framework** | [TanStack Start](https://tanstack.com/start) (full-stack React) |
| **UI Library**         | React 19                                                        |
| **Language**           | TypeScript 5.9                                                  |
| **Styling**            | Tailwind CSS v4                                                 |
| **UI Components**      | Base UI + shadcn/ui                                             |
| **Backend**            | [Convex](https://convex.dev) (serverless database + functions)  |
| **Authentication**     | Better Auth with Convex adapter                                 |
| **Email**              | Resend (via `@convex-dev/resend`)                               |
| **Push Notifications** | Web Push API                                                    |
| **Build Tool**         | Vite 7                                                          |
| **Query Client**       | TanStack Query + Convex React Query                             |
| **Testing**            | Vitest + convex-test + edge-runtime                             |

---

## Project Structure

```
├── convex/                    # Convex backend functions and schema
│   ├── _generated/           # Auto-generated Convex types and API
│   ├── betterAuth/           # Better Auth component files
│   ├── __tests__/            # Unit tests for Convex functions
│   │   ├── auth.test.ts
│   │   ├── groups.test.ts
│   │   ├── invites.test.ts
│   │   ├── messages.test.ts
│   │   ├── push.test.ts
│   │   ├── settings.test.ts
│   │   └── users.test.ts
│   ├── auth.ts               # Authentication configuration & helpers
│   ├── auth.config.ts        # Convex auth config provider
│   ├── schema.ts             # Database schema definition
│   ├── convex.config.ts      # Convex app configuration
│   ├── messages.ts           # Message CRUD, scheduling, delivery
│   ├── events.ts             # Event management
│   ├── groups.ts             # Group and membership management
│   ├── users.ts              # User management
│   ├── invites.ts            # Invitation system
│   ├── push.ts               # Push subscription management
│   ├── pushActions.ts        # Push notification sending (Node.js action)
│   ├── email.ts              # Resend email integration
│   ├── impersonation.ts      # Admin impersonation logging
│   ├── crons.ts              # Scheduled cron jobs
│   └── http.ts               # HTTP routes and webhooks
│
├── src/                       # Frontend source code
│   ├── components/           # React components
│   │   ├── compose/          # Message composition wizard
│   │   ├── events/           # Event management dialogs
│   │   ├── ui/               # shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── impersonation-banner.tsx
│   │   ├── mobile-bottom-nav.tsx
│   │   └── pwa-install-prompt.tsx
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and auth clients
│   │   ├── auth-client.tsx   # Better Auth client setup
│   │   ├── auth-server.ts    # Server-side auth handler
│   │   ├── auth-env.ts       # Auth environment resolution
│   │   └── utils.ts          # cn() helper for Tailwind
│   ├── routes/               # TanStack Start file-based routes
│   │   ├── __root.tsx        # Root layout with PWA setup
│   │   ├── index.tsx         # Landing page
│   │   ├── sign-in.tsx       # Sign in page
│   │   ├── sign-up.tsx       # Sign up page
│   │   ├── docs.notifications.tsx  # Notification documentation
│   │   ├── _authed.tsx       # Auth guard layout
│   │   ├── _authed/          # Protected routes
│   │   │   ├── inbox.tsx     # Member message feed (eager-loaded)
│   │   │   ├── inbox.lazy.tsx
│   │   │   ├── settings.tsx  # User settings
│   │   │   ├── messages.$id.tsx     # Message detail view
│   │   │   └── _admin.tsx    # Admin guard layout
│   │   │       ├── dashboard.lazy.tsx
│   │   │       ├── system-settings.lazy.tsx
│   │   │       ├── users/
│   │   │       ├── groups/
│   │   │       ├── events/
│   │   │       └── messages/
│   │   └── api/auth/$.ts     # Auth API routes
│   ├── router.tsx            # TanStack Router configuration
│   ├── routeTree.gen.ts      # Auto-generated route tree
│   └── styles/app.css        # Tailwind CSS entry with theme variables
│
├── public/                    # Static assets
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker for push notifications & offline
│   └── icons/                # PWA icons
│
├── docs/                      # Documentation
├── design-system/             # Design specifications
└── Configuration files
```

---

## Build and Development Commands

```bash
# Development (starts both Convex dev server and Vite)
npm run dev

# Development (web only)
npm run dev:web

# Development (Convex only)
npm run dev:convex

# Type checking in watch mode
npm run dev:ts

# Production build
npm run build

# Start production server
npm start

# Code formatting
npm run format

# Linting
npm run lint

# Testing
npm test                    # Run tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
```

---

## Environment Variables

Create `.env.local` in the project root with these variables:

```bash
# Convex Configuration (required)
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site

# Push Notifications - Frontend (optional)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### Convex Dashboard Environment Variables

Set these in your Convex dashboard or via CLI (`npx convex env set`):

```bash
# Better Auth Configuration (required)
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
SITE_URL=http://localhost:3000

# Super Admin Setup (optional)
SUPER_ADMIN_EMAIL=admin@example.com

# Email Configuration (optional)
RESEND_API_KEY=re_xxx

# Push Notifications (optional)
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
```

---

## Database Schema

### Core Tables

| Table               | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `users`             | App users with roles (member/admin/super_admin) |
| `groups`            | User groups for audience targeting              |
| `groupMemberships`  | Many-to-many user-group relationships           |
| `events`            | Events that messages can be linked to           |
| `eventGroupLinks`   | Links between events and groups                 |
| `messages`          | Broadcast messages with scheduling              |
| `messageTargets`    | Target groups/events for messages               |
| `deliveries`        | Per-user message delivery records               |
| `invites`           | Pending user invitations                        |
| `impersonationLogs` | Admin impersonation audit trail                 |
| `pushSubscriptions` | Web Push API subscriptions                      |
| `settings`          | System configuration key-value store            |

### Role Hierarchy

- **member**: View feed, receive notifications, manage preferences
- **admin**: All member capabilities + create messages, manage groups/events, invite users
- **super_admin**: All admin capabilities + manage admin roles, system configuration

---

## Authentication Architecture

This project uses **Better Auth** with the Convex adapter:

1. **Client-side**: `src/lib/auth-client.tsx` creates a Better Auth client with Convex and admin plugins
2. **Server-side**: `src/lib/auth-server.ts` provides handlers for TanStack Start SSR
3. **Convex**: `convex/auth.ts` configures the auth component with user creation triggers

### Auth Flow

- Email/password authentication is enabled
- Admin invitations can pre-create accounts
- New users are automatically assigned "member" role (or "super_admin" if email matches `SUPER_ADMIN_EMAIL` or if they're the first user)
- Session tokens are validated via Better Auth's Convex integration
- The first user to sign up automatically becomes super_admin (bootstrap scenario)

---

## Code Organization Conventions

### File Organization

- **Routes**: File-based routing via TanStack Start. Route files use `createFileRoute` export.
- **Route Guards**:
  - `_authed.tsx` - Requires authentication
  - `_authed/_admin.tsx` - Requires admin role
  - `_authed/_admin/*.lazy.tsx` - Lazy-loaded admin routes
- **Components**: Co-located UI components in `src/components/`
- **Convex Functions**: Grouped by domain (messages, events, groups, etc.)

### Naming Conventions

- **Routes**: Use kebab-case filenames (`sign-in.tsx`, `messages.$id.tsx`)
- **Convex Functions**: Use camelCase exports (`create`, `getById`, `list`)
- **Components**: PascalCase (`Button.tsx`, `UserCard.tsx`)
- **Types**: PascalCase with descriptive names

### Path Aliases

```typescript
// Use ~/* alias for src imports
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

// For Convex, use relative imports within convex/ or api import
import { api } from "../../convex/_generated/api";
```

---

## Styling Guidelines

### Tailwind CSS v4

- CSS variables defined in `src/styles/app.css` using `@theme` directive
- Color scheme:
  - Primary: Purple (`#6366F1`)
  - CTA: Green (`#10B981`)
  - Background: Light purple (`#f5f3ff`)
  - Foreground: Dark indigo (`#1e1b4b`)
- Use `cn()` utility from `~/lib/utils` for conditional classes
- Font: Plus Jakarta Sans (loaded from Google Fonts)

### shadcn/ui Components

Components are built on **Base UI** primitives with Tailwind styling:

```typescript
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
```

Available components in `src/components/ui/`: button, card, dialog, input, select, table, tabs, checkbox, badge, avatar, and more.

---

## Convex Development Patterns

### Query/Mutation Structure

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser, getAdminUser } from "./auth";

export const list = query({
  args: {
    /* validation schema */
  },
  handler: async (ctx, args) => {
    // Authentication check
    await getUser(ctx);
    // ... query logic
  },
});
```

### Auth Helpers in Convex

- `getUser(ctx)` - Requires authenticated user
- `safeGetUser(ctx)` - Returns null instead of throwing (for hydration-safe queries)
- `getAdminUser(ctx)` - Requires admin or super_admin role
- `getSuperAdminUser(ctx)` - Requires super_admin role

### Internal Functions

Use `internalMutation` and `internalAction` for functions called by other Convex functions:

```typescript
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const myInternalFn = internalMutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    /* ... */
  },
});

// Called via:
await ctx.scheduler.runAfter(0, internal.moduleName.functionName, args);
```

---

## Testing

### Test Setup

- **Framework**: Vitest with `edge-runtime` environment (emulates Convex V8)
- **Convex Testing**: `convex-test` library for isolated Convex function tests
- **Test Location**: `convex/__tests__/**/*.test.ts`

### Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Run in watch mode
npm run test:coverage # With coverage report
```

### Test Patterns

```typescript
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const t = convexTest(schema, import.meta.glob("../**/*.ts"));

test("feature works", async () => {
  // Seed test data
  await t.run(async (ctx) => {
    await ctx.db.insert("users", { /* ... */ });
  });
  
  // Test the function
  const result = await t.query(api.module.function, { args });
  expect(result).toEqual(expected);
});
```

### Test Limitations

**Note**: Authenticated scenarios requiring Better Auth session state are limited because `convex-test`'s `t.withIdentity()` only sets `ctx.auth.getUserIdentity()` — it does not seed the Better Auth component's session tables. Tests focus on unauthenticated paths and direct database operations.

---

## Push Notifications

### Architecture

1. **Subscription**: Users subscribe via browser Push API in `convex/push.ts`
2. **Scheduling**: When a message is sent, `convex/messages.ts` schedules push delivery
3. **Sending**: `convex/pushActions.ts` (Node.js action) sends notifications via `web-push` library
4. **Service Worker**: `public/sw.js` handles incoming push events and notification clicks

### Preferences

Users can set notification preferences per subscription:

- `all` - All notifications
- `urgent` - Only urgent category messages
- `none` - No push notifications

---

## PWA / Service Worker

The service worker (`public/sw.js`) provides:

1. **Offline Support**: Precaches critical routes (`/`, `/inbox`, `/settings`, `/sign-in`)
2. **Network Strategy**: Network-first for navigation, cache-first for static assets
3. **Push Notifications**: Handles incoming push events with badge updates
4. **Notification Click**: Opens relevant message and clears badge

### PWA Manifest

- `public/manifest.json` defines app metadata
- Theme color: `#6366F1` (purple)
- Background color: `#F5F3FF` (light purple)
- Start URL: `/inbox`

---

## Deployment

### Vercel

The project includes `vercel.json` with build command:

```json
{
  "buildCommand": "npx convex deploy --cmd 'npm run build'"
}
```

### Netlify

The project includes `netlify.toml` with:

- Build command: `npm run build`
- SSR function handler
- Static asset redirects
- Environment-specific `SITE_URL` configuration

### Environment Setup for Production

1. Set up Convex production deployment
2. Configure all environment variables in Convex dashboard
3. Set `SITE_URL` to your production URL
4. Generate and set VAPID keys for push notifications

---

## Security Considerations

1. **Authentication**: All Convex functions verify authentication via `getUser()` helpers
2. **Authorization**: Role checks in `convex/auth.ts` enforce access control
3. **Environment Variables**: Sensitive keys (VAPID, BETTER_AUTH_SECRET) are server-side only
4. **Impersonation Logging**: All impersonation actions are audited to `impersonationLogs` table
5. **Invite Expiry**: Invitations expire after 7 days
6. **CORS**: Convex handles CORS for API endpoints

---

## Key Development Notes

### Message Scheduling

- Messages can be scheduled for future delivery
- Scheduled messages use Convex's `ctx.scheduler.runAt()`
- Rescheduling cancels the previous scheduled function

### Batch Operations

Large operations (like deleting messages with many deliveries) use internal mutations with batching to avoid hitting Convex's 1024 operation limit per mutation.

### Hydration Race Condition

The `feed` query uses `safeGetUser()` to return an empty array during the brief auth initialization window, preventing errors during client-side hydration.

### Lazy Loading

Admin routes use `.lazy.tsx` suffix for code-splitting. The inbox route is eagerly loaded (`inbox.tsx`) for fast initial render.

---

## Additional Resources

- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [Convex Documentation](https://docs.convex.dev)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)

---

## Project Documentation

Additional documentation is available in the `docs/` directory:

- `org-comms-pwa-spec.md` - Full specification document
- `Better auth convex.md` - Better Auth integration notes
- `plans/` - Implementation plans and design documents

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
