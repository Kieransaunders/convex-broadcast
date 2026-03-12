# Org Comms PWA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-organisation broadcast communication PWA where admins send targeted messages to members via in-app feed and push notifications.

**Architecture:** Layer Cake approach - build schema + auth foundation first, then CRUD functions, then messaging logic, then UI, then PWA. Convex backend with Better Auth, TanStack Start frontend with shadcn/ui, Resend for emails.

**Tech Stack:** React 19, TanStack Start/Router/Query, Convex, Better Auth + admin plugin, @convex-dev/resend, shadcn/ui, Tailwind v4, Plus Jakarta Sans, Lucide icons, Web Push API

**Design System:** `design-system/org-comms-pwa/MASTER.md`

**Reference Skills:** `@better-auth`, `@convex`, `@shadcn-ui`, `@tailwind-v4`, `@tanstack`

---

## Layer 1: Schema + Auth + Resend Component

### Task 1: Install dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install Better Auth and Resend**

```bash
npm install better-auth @convex-dev/better-auth @convex-dev/resend web-push lucide-react
```

**Step 2: Install shadcn/ui prerequisites**

```bash
npx shadcn@latest init
```

When prompted:

- Style: Default
- Base color: Slate
- CSS variables: Yes

**Step 3: Install Plus Jakarta Sans**

Add to `src/styles/app.css` (will be done in Task 5).

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install better-auth, resend, web-push, lucide, shadcn/ui"
```

---

### Task 2: Convex schema

**Files:**

- Modify: `convex/schema.ts`

**Step 1: Write the application schema**

Replace `convex/schema.ts` with:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("member"),
      v.literal("admin"),
      v.literal("super_admin"),
    ),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  groups: defineTable({
    name: v.string(),
    description: v.string(),
    active: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_active", ["active"]),

  groupMemberships: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    role: v.union(v.literal("member"), v.literal("manager")),
    addedBy: v.id("users"),
    addedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_groupId", ["groupId"])
    .index("by_userId_groupId", ["userId", "groupId"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    location: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("changed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_startsAt", ["startsAt"]),

  messages: defineTable({
    title: v.string(),
    body: v.string(),
    category: v.union(
      v.literal("notice"),
      v.literal("reminder"),
      v.literal("event_update"),
      v.literal("urgent"),
    ),
    audienceType: v.union(
      v.literal("all"),
      v.literal("groups"),
      v.literal("event"),
    ),
    linkedEventId: v.optional(v.id("events")),
    pushEnabled: v.boolean(),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("sent"),
      v.literal("archived"),
    ),
    scheduledFor: v.optional(v.number()),
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
    sentAt: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdBy", ["createdBy"])
    .index("by_scheduledFor", ["scheduledFor"]),

  messageTargets: defineTable({
    messageId: v.id("messages"),
    targetType: v.union(v.literal("group"), v.literal("event")),
    targetId: v.string(),
  }).index("by_messageId", ["messageId"]),

  deliveries: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    deliveredAt: v.number(),
    readAt: v.optional(v.number()),
    pushStatus: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("none"),
    ),
  })
    .index("by_messageId", ["messageId"])
    .index("by_userId", ["userId"])
    .index("by_userId_messageId", ["userId", "messageId"]),

  invites: defineTable({
    email: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    expiresAt: v.number(),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
    ),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  impersonationLogs: defineTable({
    adminUserId: v.id("users"),
    impersonatedUserId: v.id("users"),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  }).index("by_adminUserId", ["adminUserId"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    preference: v.union(
      v.literal("all"),
      v.literal("urgent"),
      v.literal("none"),
    ),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
```

**Step 2: Verify schema compiles**

```bash
npx convex dev --once
```

Expected: Schema should push successfully.

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add complete application schema with all tables and indexes"
```

---

### Task 3: Better Auth setup

**Files:**

- Create: `convex/convex.config.ts`
- Create: `convex/betterAuth/convex.config.ts`
- Create: `convex/auth.config.ts`
- Create: `convex/auth.ts`
- Create: `convex/http.ts`
- Create: `convex/betterAuth/adapter.ts`
- Create: `src/lib/auth-client.tsx`
- Create: `src/lib/auth-server.ts`
- Create: `src/routes/api/auth/$.ts`

Refer to `@better-auth` skill for all code patterns. Key points:

**Step 1: Create `convex/betterAuth/convex.config.ts`**

```typescript
import { defineComponent } from "convex/server";
export default defineComponent("betterAuth");
```

**Step 2: Generate Better Auth schema**

```bash
cd convex/betterAuth && npx @better-auth/cli generate -y
```

**Step 3: Create `convex/convex.config.ts`**

```typescript
import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp();
app.use(betterAuth);
app.use(resend);
export default app;
```

**Step 4: Create `convex/auth.config.ts`**

```typescript
import type { AuthConfig } from "convex/server";
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

**Step 5: Create `convex/auth.ts`**

```typescript
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { createClient, GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins";
import { components, internal } from "./_generated/api";
import betterAuthSchema from "./betterAuth/schema";
import { query, QueryCtx } from "./_generated/server";
import { DataModel, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import authConfig from "./auth.config";

export const authComponent = createClient<DataModel, typeof betterAuthSchema>(
  components.betterAuth,
  {
    authFunctions: internal.auth,
    local: { schema: betterAuthSchema },
    triggers: {
      user: {
        onCreate: async (ctx, authUser) => {
          const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
          const role =
            authUser.email === superAdminEmail
              ? ("super_admin" as const)
              : ("member" as const);
          const userId = await ctx.db.insert("users", {
            email: authUser.email,
            name: authUser.name ?? authUser.email,
            role,
            status: "active",
            createdAt: Date.now(),
          });
          await authComponent.setUserId(ctx, authUser._id, userId);
        },
        onDelete: async (ctx, authUser) => {
          const user = await ctx.db.get(authUser.userId as Id<"users">);
          if (user) await ctx.db.delete(user._id);
        },
      },
    },
  },
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
export const { getAuthUser } = authComponent.clientApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    baseURL: process.env.SITE_URL,
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true },
    account: { accountLinking: { enabled: true } },
    plugins: [convex({ authConfig }), admin()],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

export const getUser = async (ctx: QueryCtx) => {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) throw new ConvexError("Unauthenticated");
  const user = await ctx.db.get(authUser.userId as Id<"users">);
  if (!user) throw new ConvexError("User not found");
  return user;
};

export const getAdminUser = async (ctx: QueryCtx) => {
  const user = await getUser(ctx);
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new ConvexError("Unauthorized: admin access required");
  }
  return user;
};

export const getSuperAdminUser = async (ctx: QueryCtx) => {
  const user = await getUser(ctx);
  if (user.role !== "super_admin") {
    throw new ConvexError("Unauthorized: super admin access required");
  }
  return user;
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return null;
    return await ctx.db.get(authUser.userId as Id<"users">);
  },
});
```

**Step 6: Create `convex/http.ts`**

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { resend } from "./email";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;
```

**Step 7: Create `convex/betterAuth/adapter.ts`**

```typescript
import { createApi } from "@convex-dev/better-auth";
import schema from "./schema";
import { createAuthOptions } from "../auth";

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuthOptions);
```

**Step 8: Create `src/lib/auth-client.tsx`**

```typescript
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient(), adminClient()],
});
```

**Step 9: Create `src/lib/auth-server.ts`**

```typescript
import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

export const { handler, getToken } = convexBetterAuthReactStart({
  convexUrl: process.env.VITE_CONVEX_URL!,
  convexSiteUrl: process.env.VITE_CONVEX_SITE_URL!,
});
```

**Step 10: Create `src/routes/api/auth/$.ts`**

```typescript
import { handler } from "~/lib/auth-server";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
});
```

**Step 11: Update `src/router.tsx`**

Replace the existing router setup to use `ConvexBetterAuthProvider` and pass auth context. Refer to `@better-auth` skill section 11 for the root route pattern with `beforeLoad`, `getToken`, and `ConvexBetterAuthProvider`.

Key changes to `src/router.tsx`:

- Add `convexQueryClient` to route context type
- Pass `convexQueryClient` into context

Update `src/routes/__root.tsx`:

- Import `ConvexBetterAuthProvider` from `@convex-dev/better-auth/react`
- Import `authClient` from `~/lib/auth-client`
- Import `getToken` from `~/lib/auth-server`
- Add `createServerFn` for `getAuth`
- Add `beforeLoad` that fetches token and sets auth on `convexQueryClient`
- Wrap `<Outlet />` in `<ConvexBetterAuthProvider>`

**Step 12: Set environment variables**

```bash
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL "http://localhost:3000"
npx convex env set SUPER_ADMIN_EMAIL "your-email@example.com"
npx convex env set RESEND_API_KEY "re_your_api_key"
```

Create `.env`:

```
VITE_CONVEX_URL=https://<deployment>.convex.cloud
VITE_CONVEX_SITE_URL=https://<deployment>.convex.site
SITE_URL=http://localhost:3000
```

**Step 13: Run `npx convex dev --once` to verify**

Expected: Deploys successfully.

**Step 14: Commit**

```bash
git add convex/ src/lib/ src/routes/api/ src/router.tsx src/routes/__root.tsx .env
git commit -m "feat: set up Better Auth with admin plugin and Resend component"
```

---

### Task 4: Resend email setup

**Files:**

- Create: `convex/email.ts`
- Create: `convex/crons.ts`

**Step 1: Create `convex/email.ts`**

```typescript
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";

export const resend = new Resend(components.resend, {});
```

**Step 2: Create `convex/crons.ts`** (cleanup old emails)

```typescript
import { cronJobs } from "convex/server";
import { components, internal } from "./_generated/api.js";
import { internalMutation } from "./_generated/server.js";

const crons = cronJobs();
crons.interval("Remove old emails", { hours: 1 }, internal.crons.cleanupResend);

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
      olderThan: ONE_WEEK_MS,
    });
    await ctx.scheduler.runAfter(
      0,
      components.resend.lib.cleanupAbandonedEmails,
      {
        olderThan: 4 * ONE_WEEK_MS,
      },
    );
  },
});

export default crons;
```

**Step 3: Verify**

```bash
npx convex dev --once
```

**Step 4: Commit**

```bash
git add convex/email.ts convex/crons.ts
git commit -m "feat: set up Resend email component with cleanup cron"
```

---

### Task 5: Design system setup (Tailwind + Plus Jakarta Sans)

**Files:**

- Modify: `src/styles/app.css`

**Step 1: Update `src/styles/app.css`**

```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap");

@theme {
  --font-sans: "Plus Jakarta Sans", sans-serif;
  --color-primary: #6366f1;
  --color-primary-foreground: #ffffff;
  --color-secondary: #818cf8;
  --color-cta: #10b981;
  --color-background: #f5f3ff;
  --color-foreground: #1e1b4b;
}

@layer base {
  html,
  body {
    @apply font-sans text-foreground bg-background antialiased;
  }
}
```

**Step 2: Commit**

```bash
git add src/styles/app.css
git commit -m "feat: configure design system with Plus Jakarta Sans and color tokens"
```

---

## Layer 2: CRUD Functions

### Task 6: User management functions

**Files:**

- Create: `convex/users.ts`

**Step 1: Create `convex/users.ts`**

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAdminUser, getSuperAdminUser, getUser } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    return await ctx.db.query("users").collect();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("member"),
      v.literal("admin"),
      v.literal("super_admin"),
    ),
  },
  handler: async (ctx, args) => {
    await getSuperAdminUser(ctx);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.patch(args.userId, { status: args.status });
  },
});
```

**Step 2: Verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/users.ts
git commit -m "feat: add user management CRUD functions"
```

---

### Task 7: Group functions

**Files:**

- Create: `convex/groups.ts`

**Step 1: Create `convex/groups.ts`**

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAdminUser, getUser } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getUser(ctx);
    return await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAdminUser(ctx);
    return await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      active: true,
      createdBy: user._id,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const getMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();
    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return { ...m, user };
      }),
    );
    return members;
  },
});

export const addMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("member"), v.literal("manager")),
  },
  handler: async (ctx, args) => {
    const admin = await getAdminUser(ctx);
    const existing = await ctx.db
      .query("groupMemberships")
      .withIndex("by_userId_groupId", (q) =>
        q.eq("userId", args.userId).eq("groupId", args.groupId),
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("groupMemberships", {
      userId: args.userId,
      groupId: args.groupId,
      role: args.role,
      addedBy: admin._id,
      addedAt: Date.now(),
    });
  },
});

export const removeMember = mutation({
  args: { membershipId: v.id("groupMemberships") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.delete(args.membershipId);
  },
});
```

**Step 2: Verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/groups.ts
git commit -m "feat: add group CRUD and membership functions"
```

---

### Task 8: Event functions

**Files:**

- Create: `convex/events.ts`

**Step 1: Create `convex/events.ts`**

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAdminUser, getUser } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getUser(ctx);
    return await ctx.db.query("events").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAdminUser(ctx);
    return await ctx.db.insert("events", {
      ...args,
      status: "scheduled",
      createdBy: user._id,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("changed"),
        v.literal("cancelled"),
        v.literal("completed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
```

**Step 2: Verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/events.ts
git commit -m "feat: add event CRUD functions"
```

---

### Task 9: Invite functions

**Files:**

- Create: `convex/invites.ts`

**Step 1: Create `convex/invites.ts`**

```typescript
import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAdminUser } from "./auth";
import { resend } from "./email";

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    return await ctx.db
      .query("invites")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const admin = await getAdminUser(ctx);
    const existing = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();
    if (existing) return existing._id;

    const inviteId = await ctx.db.insert("invites", {
      email: args.email,
      role: args.role,
      expiresAt: Date.now() + INVITE_EXPIRY_MS,
      invitedBy: admin._id,
      status: "pending",
      createdAt: Date.now(),
    });

    await resend.sendEmail(ctx, {
      from: "Org Comms <noreply@yourdomain.com>",
      to: args.email,
      subject: "You've been invited",
      html: `<p>You've been invited to join the organisation. <a href="${process.env.SITE_URL}/sign-up?invite=${inviteId}">Accept invite</a></p>`,
    });

    return inviteId;
  },
});

export const revoke = mutation({
  args: { id: v.id("invites") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.patch(args.id, { status: "expired" });
  },
});
```

**Step 2: Verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/invites.ts
git commit -m "feat: add invite functions with Resend email delivery"
```

---

## Layer 3: Messaging & Scheduling Logic

### Task 10: Message CRUD functions

**Files:**

- Create: `convex/messages.ts`

**Step 1: Create `convex/messages.ts`**

```typescript
import { v } from "convex/values";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAdminUser, getUser } from "./auth";
import { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

// --- Queries ---

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("sent"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    if (args.status) {
      return await ctx.db
        .query("messages")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) return null;
    const targets = await ctx.db
      .query("messageTargets")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.id))
      .collect();
    return { ...message, targets };
  },
});

// --- Mutations ---

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    category: v.union(
      v.literal("notice"),
      v.literal("reminder"),
      v.literal("event_update"),
      v.literal("urgent"),
    ),
    audienceType: v.union(
      v.literal("all"),
      v.literal("groups"),
      v.literal("event"),
    ),
    linkedEventId: v.optional(v.id("events")),
    pushEnabled: v.boolean(),
    targetIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getAdminUser(ctx);
    const { targetIds, ...messageFields } = args;
    const messageId = await ctx.db.insert("messages", {
      ...messageFields,
      status: "draft",
      createdBy: user._id,
      createdAt: Date.now(),
    });
    if (targetIds && args.audienceType !== "all") {
      const targetType =
        args.audienceType === "groups"
          ? ("group" as const)
          : ("event" as const);
      for (const targetId of targetIds) {
        await ctx.db.insert("messageTargets", {
          messageId,
          targetType,
          targetId,
        });
      }
    }
    return messageId;
  },
});

export const update = mutation({
  args: {
    id: v.id("messages"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("notice"),
        v.literal("reminder"),
        v.literal("event_update"),
        v.literal("urgent"),
      ),
    ),
    audienceType: v.optional(
      v.union(v.literal("all"), v.literal("groups"), v.literal("event")),
    ),
    linkedEventId: v.optional(v.id("events")),
    pushEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status === "sent" || message.status === "archived") {
      throw new ConvexError("Cannot edit sent or archived messages");
    }
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const archive = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status !== "sent")
      throw new ConvexError("Can only archive sent messages");
    await ctx.db.patch(args.id, { status: "archived" });
  },
});

// --- Audience Resolution ---

export const resolveAudience = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new ConvexError("Message not found");

    let userIds: Id<"users">[] = [];

    if (message.audienceType === "all") {
      const users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect();
      userIds = users.map((u) => u._id);
    } else {
      const targets = await ctx.db
        .query("messageTargets")
        .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
        .collect();

      if (message.audienceType === "groups") {
        const membershipSets = await Promise.all(
          targets.map((t) =>
            ctx.db
              .query("groupMemberships")
              .withIndex("by_groupId", (q) =>
                q.eq("groupId", t.targetId as Id<"groups">),
              )
              .collect(),
          ),
        );
        const uniqueIds = new Set(membershipSets.flat().map((m) => m.userId));
        userIds = [...uniqueIds];
      } else if (message.audienceType === "event") {
        // Event audience: for now, resolve via messageTargets with event targetId
        // Future: link events to groups for more granular targeting
        const allUsers = await ctx.db
          .query("users")
          .withIndex("by_status", (q) => q.eq("status", "active"))
          .collect();
        userIds = allUsers.map((u) => u._id);
      }
    }

    // Create delivery records
    const now = Date.now();
    for (const userId of userIds) {
      await ctx.db.insert("deliveries", {
        messageId: args.messageId,
        userId,
        deliveredAt: now,
        pushStatus: message.pushEnabled ? "pending" : "none",
      });
    }

    return userIds;
  },
});

// --- Send Logic ---

export const sendNow = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status === "sent")
      throw new ConvexError("Message already sent");

    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.messages.resolveAudience, {
      messageId: args.id,
    });

    if (message.pushEnabled) {
      await ctx.scheduler.runAfter(500, internal.push.sendPushForMessage, {
        messageId: args.id,
      });
    }
  },
});

export const schedule = mutation({
  args: {
    id: v.id("messages"),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status === "sent")
      throw new ConvexError("Cannot schedule sent message");

    // Cancel existing scheduled function if rescheduling
    if (message.scheduledFunctionId) {
      await ctx.scheduler.cancel(message.scheduledFunctionId);
    }

    const scheduledFunctionId = await ctx.scheduler.runAt(
      args.scheduledFor,
      internal.messages.executeSend,
      { messageId: args.id },
    );

    await ctx.db.patch(args.id, {
      status: "scheduled",
      scheduledFor: args.scheduledFor,
      scheduledFunctionId,
    });
  },
});

export const cancelScheduled = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) throw new ConvexError("Message not found");
    if (message.status !== "scheduled")
      throw new ConvexError("Message is not scheduled");

    if (message.scheduledFunctionId) {
      await ctx.scheduler.cancel(message.scheduledFunctionId);
    }

    await ctx.db.patch(args.id, {
      status: "draft",
      scheduledFor: undefined,
      scheduledFunctionId: undefined,
    });
  },
});

export const executeSend = internalMutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.status !== "scheduled") return;

    await ctx.db.patch(args.messageId, {
      status: "sent",
      sentAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.messages.resolveAudience, {
      messageId: args.messageId,
    });

    if (message.pushEnabled) {
      await ctx.scheduler.runAfter(500, internal.push.sendPushForMessage, {
        messageId: args.messageId,
      });
    }
  },
});

// --- Member Feed ---

export const feed = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    const messages = await Promise.all(
      deliveries.map(async (d) => {
        const message = await ctx.db.get(d.messageId);
        return message ? { ...message, delivery: d } : null;
      }),
    );
    return messages.filter(Boolean);
  },
});

export const markRead = mutation({
  args: { deliveryId: v.id("deliveries") },
  handler: async (ctx, args) => {
    await getUser(ctx);
    await ctx.db.patch(args.deliveryId, { readAt: Date.now() });
  },
});

// --- Delivery Stats ---

export const getDeliveryStats = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    const deliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();

    return {
      total: deliveries.length,
      read: deliveries.filter((d) => d.readAt).length,
      pushSent: deliveries.filter((d) => d.pushStatus === "sent").length,
      pushFailed: deliveries.filter((d) => d.pushStatus === "failed").length,
      pushPending: deliveries.filter((d) => d.pushStatus === "pending").length,
    };
  },
});
```

**Step 2: Verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/messages.ts
git commit -m "feat: add message CRUD, audience resolution, scheduling, and feed"
```

---

### Task 11: Push notification functions

**Files:**

- Create: `convex/push.ts`

**Step 1: Create `convex/push.ts`**

```typescript
"use node";

import { v } from "convex/values";
import { internalAction, action, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUser } from "./auth";
import { Id } from "./_generated/dataModel";
import webpush from "web-push";

// --- Subscription Management ---

export const subscribe = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    preference: v.union(
      v.literal("all"),
      v.literal("urgent"),
      v.literal("none"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    // Remove existing subscription for this endpoint
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const match = existing.find((s) => s.endpoint === args.endpoint);
    if (match) await ctx.db.delete(match._id);

    return await ctx.db.insert("pushSubscriptions", {
      userId: user._id,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      preference: args.preference,
      createdAt: Date.now(),
    });
  },
});

export const unsubscribe = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    const match = subs.find((s) => s.endpoint === args.endpoint);
    if (match) await ctx.db.delete(match._id);
  },
});

export const updatePreference = mutation({
  args: {
    preference: v.union(
      v.literal("all"),
      v.literal("urgent"),
      v.literal("none"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const sub of subs) {
      await ctx.db.patch(sub._id, { preference: args.preference });
    }
  },
});

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    return subs[0] ?? null;
  },
});

// --- Push Sending (Node.js action) ---

export const sendPushForMessage = internalAction({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(internal.push.getMessageForPush, {
      messageId: args.messageId,
    });
    if (!message) return;

    const deliveries = await ctx.runQuery(internal.push.getPendingDeliveries, {
      messageId: args.messageId,
    });

    const vapidPublic = process.env.VAPID_PUBLIC_KEY!;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY!;
    webpush.setVapidDetails(
      "mailto:admin@yourdomain.com",
      vapidPublic,
      vapidPrivate,
    );

    for (const delivery of deliveries) {
      const subs = await ctx.runQuery(internal.push.getUserSubscriptions, {
        userId: delivery.userId,
      });

      for (const sub of subs) {
        // Filter by preference
        if (sub.preference === "none") continue;
        if (sub.preference === "urgent" && message.category !== "urgent")
          continue;

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({
              title: message.title,
              body: message.body.substring(0, 200),
              url: `/messages/${args.messageId}`,
            }),
          );
          await ctx.runMutation(internal.push.updateDeliveryPushStatus, {
            deliveryId: delivery._id,
            status: "sent",
          });
        } catch (error) {
          await ctx.runMutation(internal.push.updateDeliveryPushStatus, {
            deliveryId: delivery._id,
            status: "failed",
          });
          // If subscription is gone (410), clean it up
          if ((error as any)?.statusCode === 410) {
            await ctx.runMutation(internal.push.removeSubscription, {
              subscriptionId: sub._id,
            });
          }
        }
      }
    }
  },
});

// --- Internal helpers for the action ---

export const getMessageForPush = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const getPendingDeliveries = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliveries")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("pushStatus"), "pending"))
      .collect();
  },
});

export const getUserSubscriptions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const updateDeliveryPushStatus = internalMutation({
  args: {
    deliveryId: v.id("deliveries"),
    status: v.union(v.literal("sent"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.deliveryId, { pushStatus: args.status });
  },
});

export const removeSubscription = internalMutation({
  args: { subscriptionId: v.id("pushSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subscriptionId);
  },
});
```

**Step 2: Verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/push.ts
git commit -m "feat: add push notification subscription and delivery functions"
```

---

### Task 12: Impersonation log functions

**Files:**

- Create: `convex/impersonation.ts`

**Step 1: Create `convex/impersonation.ts`**

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAdminUser } from "./auth";

export const logStart = mutation({
  args: { impersonatedUserId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await getAdminUser(ctx);
    return await ctx.db.insert("impersonationLogs", {
      adminUserId: admin._id,
      impersonatedUserId: args.impersonatedUserId,
      startedAt: Date.now(),
    });
  },
});

export const logEnd = mutation({
  args: { logId: v.id("impersonationLogs") },
  handler: async (ctx, args) => {
    await getAdminUser(ctx);
    await ctx.db.patch(args.logId, { endedAt: Date.now() });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await getAdminUser(ctx);
    return await ctx.db.query("impersonationLogs").order("desc").take(100);
  },
});
```

**Step 2: Verify**

```bash
npx convex dev --once
```

**Step 3: Commit**

```bash
git add convex/impersonation.ts
git commit -m "feat: add impersonation logging functions"
```

---

## Layer 4: UI Shell + Admin Dashboard

### Task 13: shadcn/ui components + app shell

Install the shadcn/ui components needed across the app. Refer to `@shadcn-ui` skill.

**Step 1: Install shadcn components**

```bash
npx shadcn@latest add button card input label textarea select badge dialog table tabs sidebar separator avatar dropdown-menu toast skeleton
```

**Step 2: Create app shell layout**

**Files:**

- Modify: `src/routes/__root.tsx` - Add PWA registration, ConvexBetterAuthProvider
- Create: `src/routes/_authed.tsx` - Auth guard layout
- Create: `src/routes/_authed/_admin.tsx` - Admin guard with sidebar
- Create: `src/components/admin-sidebar.tsx` - Admin navigation sidebar
- Create: `src/components/user-nav.tsx` - User avatar + dropdown

Refer to `@tanstack` skill for route layout patterns, `@shadcn-ui` for sidebar component, `@tailwind-v4` for styling with design tokens from `design-system/org-comms-pwa/MASTER.md`.

**Step 3: Commit**

```bash
git add src/
git commit -m "feat: add app shell with auth guard, admin layout, and sidebar navigation"
```

---

### Task 14: Auth pages

**Files:**

- Create: `src/routes/sign-in.tsx`
- Create: `src/routes/sign-up.tsx`
- Modify: `src/routes/index.tsx` - Landing page

**Step 1: Build sign-in page**

Use `authClient.signIn.email({ email, password })` from `~/lib/auth-client`. Form with email + password inputs, submit button, link to sign-up. Redirect to `/feed` on success.

**Step 2: Build sign-up page**

Use `authClient.signUp.email({ name, email, password })`. Form with name + email + password. Handle invite token from query params if present. Redirect to `/feed` on success.

**Step 3: Build landing page**

Simple landing page at `/` with app description, sign-in/sign-up buttons. Use design system colors and Plus Jakarta Sans.

**Step 4: Commit**

```bash
git add src/routes/sign-in.tsx src/routes/sign-up.tsx src/routes/index.tsx
git commit -m "feat: add sign-in, sign-up, and landing pages"
```

---

### Task 15: Admin dashboard pages

**Files:**

- Create: `src/routes/_authed/_admin/dashboard.tsx`
- Create: `src/routes/_authed/_admin/users/index.tsx`
- Create: `src/routes/_authed/_admin/groups/index.tsx`
- Create: `src/routes/_authed/_admin/groups/$id.tsx`
- Create: `src/routes/_authed/_admin/events/index.tsx`
- Create: `src/routes/_authed/_admin/events/$id.tsx`
- Create: `src/routes/_authed/_admin/messages/index.tsx`
- Create: `src/routes/_authed/_admin/messages/new.tsx`
- Create: `src/routes/_authed/_admin/messages/$id.tsx`

Each page uses Convex queries/mutations via `@convex-dev/react-query`. Refer to `@convex` skill for query patterns, `@shadcn-ui` for DataTable, Dialog, Form components.

**Step 1: Dashboard** - KPI cards (total users, messages sent, unread count)

**Step 2: Users page** - DataTable with role badges, invite dialog, role management

**Step 3: Groups pages** - List + detail with member management

**Step 4: Events pages** - List + detail with status management

**Step 5: Messages pages** - List with status tabs (draft/scheduled/sent), create form with audience picker, detail with delivery stats

**Step 6: Commit after each page or logical group**

---

## Layer 5: Member Feed + Settings

### Task 16: Member feed

**Files:**

- Create: `src/routes/_authed/feed.tsx`
- Create: `src/routes/_authed/messages.$id.tsx`

**Step 1: Build feed page**

Use `messages.feed` query. Display messages as cards with title, body preview, category badge, timestamp. Unread indicator using `delivery.readAt`. Mark as read on click via `messages.markRead`.

**Step 2: Build message detail**

Full message view with title, body, category, timestamp. Auto-mark as read on mount.

**Step 3: Commit**

```bash
git add src/routes/_authed/feed.tsx src/routes/_authed/messages.\$id.tsx
git commit -m "feat: add member message feed and detail views"
```

---

### Task 17: Settings page

**Files:**

- Create: `src/routes/_authed/settings.tsx`

**Step 1: Build settings page**

- Profile section: name display
- Notification preferences: radio group (all/urgent/none) using `push.updatePreference`
- Push subscription toggle: enable/disable using browser Push API + `push.subscribe`/`push.unsubscribe`
- Sign out button with `authClient.signOut({ fetchOptions: { onSuccess: () => location.reload() } })`

**Step 2: Commit**

```bash
git add src/routes/_authed/settings.tsx
git commit -m "feat: add settings page with notification preferences"
```

---

## Layer 6: PWA + Push Notifications

### Task 18: PWA manifest and service worker

**Files:**

- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `src/routes/__root.tsx` - Register service worker

**Step 1: Create `public/manifest.json`**

```json
{
  "name": "Org Comms",
  "short_name": "OrgComms",
  "description": "Organisation Communications App",
  "start_url": "/feed",
  "display": "standalone",
  "background_color": "#F5F3FF",
  "theme_color": "#6366F1",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Step 2: Create `public/sw.js`**

```javascript
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "New Message", {
      body: data.body ?? "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/feed" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/feed";
  event.waitUntil(clients.openWindow(url));
});

// Basic offline shell cache
const CACHE_NAME = "org-comms-v1";
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
```

**Step 3: Register service worker in `__root.tsx`**

Add a `useEffect` in `RootComponent`:

```typescript
React.useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

**Step 4: Update manifest link in `__root.tsx` head**

Change the existing manifest link from `/site.webmanifest` to `/manifest.json`.

**Step 5: Generate VAPID keys**

```bash
npx web-push generate-vapid-keys
```

Set them:

```bash
npx convex env set VAPID_PUBLIC_KEY "<public key>"
npx convex env set VAPID_PRIVATE_KEY "<private key>"
```

Add to `.env`:

```
VITE_VAPID_PUBLIC_KEY=<public key>
```

**Step 6: Commit**

```bash
git add public/manifest.json public/sw.js src/routes/__root.tsx .env
git commit -m "feat: add PWA manifest, service worker, and push notification support"
```

---

### Task 19: Clean up starter files

**Files:**

- Delete: `convex/myFunctions.ts`
- Delete: `src/routes/anotherPage.tsx`

**Step 1: Remove placeholder files**

```bash
rm convex/myFunctions.ts src/routes/anotherPage.tsx
```

**Step 2: Verify everything builds**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove starter placeholder files"
```

---

## Summary

| Layer         | Tasks | What It Delivers                                            |
| ------------- | ----- | ----------------------------------------------------------- |
| 1: Foundation | 1-5   | Dependencies, schema, Better Auth, Resend, design tokens    |
| 2: CRUD       | 6-9   | User, group, event, invite functions                        |
| 3: Messaging  | 10-12 | Message CRUD, scheduling, push delivery, impersonation logs |
| 4: Admin UI   | 13-15 | App shell, auth pages, admin dashboard                      |
| 5: Member UI  | 16-17 | Message feed, settings                                      |
| 6: PWA        | 18-19 | Manifest, service worker, push registration, cleanup        |

**Total: 19 tasks across 6 layers.**
