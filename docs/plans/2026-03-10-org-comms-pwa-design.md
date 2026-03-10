# Organisation Communications PWA - Design Document

## Overview

Build a single-organisation broadcast communication PWA using React + TanStack Start, Convex backend, Better Auth, shadcn/ui, and Tailwind v4. Admins broadcast targeted messages to members via in-app feed and push notifications.

## Decisions

- **Build approach:** Layer Cake - schema + CRUD first, then UI on top
- **UI library:** shadcn/ui with Tailwind v4
- **Auth:** Better Auth with email/password only + admin plugin
- **First super_admin:** Environment variable (`SUPER_ADMIN_EMAIL`) checked in `user.onCreate` trigger, combined with Better Auth admin plugin for ongoing role management
- **Push notifications:** Full PWA from the start (manifest, service worker, Web Push API)
- **Message scheduling:** Convex built-in `scheduler.runAt` (not the Crons component)
- **Components:** `@convex-dev/resend` for invite emails. No rate limiter or action retrier for v1.
- **Retry strategy:** Manual retry logic for push notifications, keep it simple

## Schema

### Better Auth managed tables (auto-generated in `convex/betterAuth/schema.ts`)
- `user`, `session`, `account`, `verification`

### Application tables (`convex/schema.ts`)

| Table | Key Fields |
|-------|-----------|
| `users` | email, name, role (`member`/`admin`/`super_admin`), status, createdAt |
| `groups` | name, description, active, createdBy, createdAt |
| `groupMemberships` | userId, groupId, role (`member`/`manager`), addedBy, addedAt |
| `events` | title, description, location, startsAt, endsAt, status (`scheduled`/`changed`/`cancelled`/`completed`), createdBy |
| `messages` | title, body, category (`notice`/`reminder`/`event_update`/`urgent`), audienceType (`all`/`groups`/`event`), linkedEventId?, pushEnabled, status (`draft`/`scheduled`/`sent`/`archived`), scheduledFor?, sentAt?, createdBy |
| `messageTargets` | messageId, targetType (`group`/`event`), targetId |
| `deliveries` | messageId, userId, deliveredAt, readAt?, pushStatus (`pending`/`sent`/`failed`/`none`) |
| `invites` | email, role, expiresAt, invitedBy, status (`pending`/`accepted`/`expired`) |
| `impersonationLogs` | adminUserId, impersonatedUserId, startedAt, endedAt? |
| `pushSubscriptions` | userId, endpoint, p256dh, auth, preference (`all`/`urgent`/`none`), createdAt |

Indexes: userId on most tables, messageId on deliveries/targets, groupId on memberships, status on messages/events/invites.

## Authentication & Roles

- Three roles: `member`, `admin`, `super_admin`
- Stored on app `users` table (not Better Auth user table)
- Default role on signup: `member`
- Bootstrap: `SUPER_ADMIN_EMAIL` env var checked in `user.onCreate` trigger
- Route protection: `/_authed` layout (auth guard), `/_authed/_admin` (role guard)
- Convex function-level auth via `getUser()` helper
- Impersonation via Better Auth admin plugin, logged to `impersonationLogs`

## Messaging & Scheduling

- Message lifecycle: draft -> scheduled -> sent -> archived
- Audience resolution: all (query all users), groups (via messageTargets + groupMemberships), event (via linked groups)
- Immediate send: status -> `sent`, create deliveries, trigger push if enabled
- Scheduled send: `scheduler.runAt(scheduledFor, ...)`, same send logic
- Edit/cancel scheduled: cancel scheduled function, reschedule or revert to draft
- Sent messages are immutable; corrections require new message

## PWA & Push Notifications

- `public/manifest.json` - app manifest, standalone display
- `public/sw.js` - push event handling, notification clicks, basic offline shell cache
- Registration on mount in root route
- Push subscription flow: user enables -> browser permission -> `PushManager.subscribe()` with VAPID key -> save to `pushSubscriptions`
- Delivery: resolve subscriptions per user, filter by preference, call Web Push API via Convex action, update `deliveries.pushStatus`
- Env vars: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (Convex), `VITE_VAPID_PUBLIC_KEY` (frontend)

## Convex Components

- `@convex-dev/resend` - invite emails with queuing, batching, idempotency
- `@convex-dev/better-auth` - authentication

## UI Structure

```
src/routes/
  __root.tsx              # ConvexBetterAuthProvider, PWA registration
  index.tsx               # Landing page
  sign-in.tsx             # Email/password sign in
  sign-up.tsx             # Email/password sign up
  _authed.tsx             # Auth guard layout
  _authed/
    feed.tsx              # Member message feed
    messages.$id.tsx      # Message detail
    settings.tsx          # Notification preferences, profile
    _admin.tsx            # Admin role guard layout
    _admin/
      dashboard.tsx       # Overview/stats
      messages/
        index.tsx         # List drafts, scheduled, sent
        new.tsx           # Create/edit message
        $id.tsx           # Message detail + delivery stats
      groups/
        index.tsx         # List groups
        $id.tsx           # Group detail + members
      events/
        index.tsx         # List events
        $id.tsx           # Event detail
      users/
        index.tsx         # User list + invite
```

## Design System

- **Style:** Data-Dense Dashboard
- **Colors:** Indigo `#6366F1` primary, `#818CF8` secondary, Emerald `#10B981` CTA, `#F5F3FF` background, `#1E1B4B` text
- **Typography:** Plus Jakarta Sans (heading + body) - friendly, modern, approachable
- **Icons:** Lucide React (consistent with shadcn/ui)
- **Effects:** Hover tooltips, row highlighting, smooth filter animations, skeleton loading
- **Anti-patterns:** No emojis as icons, no ornate design, no layout-shifting hovers
- **Full design system:** `design-system/org-comms-pwa/MASTER.md`

## Build Order (Layer Cake)

1. Schema (all tables) + Better Auth with admin plugin + Resend component
2. CRUD functions for all entities
3. Message targeting + scheduling logic
4. UI shell + admin dashboard
5. Member feed + notification preferences
6. PWA + push notifications
