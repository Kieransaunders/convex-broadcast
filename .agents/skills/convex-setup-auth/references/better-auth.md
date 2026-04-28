# Better Auth + Convex

Official docs: https://labs.convex.dev/better-auth  
Component page: https://www.convex.dev/components/better-auth  
GitHub: https://github.com/get-convex/better-auth

Use when the app wants full-featured auth (email/password, OAuth, 2FA, magic link, passkeys) managed inside Convex with no external auth SaaS dependency. Better Auth stores all auth data (users, sessions, accounts, JWKS) in the Convex database via a Convex component.

## Requirements

- `convex` >= 1.25.0
- `better-auth` package plus `@convex-dev/better-auth` component

## Architecture Overview

Better Auth with Convex has four layers:

1. **Convex component** (`convex/betterAuth/`) — isolated component tables for auth data (users, sessions, accounts, JWKS, etc.)
2. **Backend auth config** (`convex/auth.ts`) — `createClient` + `createAuth` wiring, HTTP route registration, trigger callbacks
3. **Convex auth.config.ts** — tells Convex how to validate JWTs issued by Better Auth
4. **Frontend client** (`src/lib/auth-client.ts`) — Better Auth client with `convexClient()` plugin for token exchange

## Installation

```bash
npm install better-auth @convex-dev/better-auth
```

## Step 1: Register the Component

Create `convex/betterAuth/convex.config.ts`:

```ts
import { defineComponent } from "convex/server";
export default defineComponent("betterAuth");
```

Register it in `convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();
app.use(betterAuth);
export default app;
```

## Step 2: Generate the Schema

Better Auth manages its own tables inside the component. Copy the generated schema into `convex/betterAuth/schema.ts`. Generate it with:

```bash
npx @better-auth/cli generate --output convex/betterAuth/schema.ts
```

Or copy from `node_modules/@convex-dev/better-auth/src/component/schema.ts`. The schema defines: `user`, `session`, `account`, `verification`, `jwks`, `rateLimit`, and optional plugin tables (`twoFactor`, `passkey`, `oauthApplication`, etc.).

The schema file comment says not to edit it manually — regenerate when adding Better Auth plugins.

## Step 3: Configure `convex/auth.config.ts`

```ts
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

`getAuthConfigProvider` sets up a `customJwt` provider using `CONVEX_SITE_URL` and the JWKS endpoint at `{CONVEX_SITE_URL}/api/auth/convex/jwks`.

For static JWKS (avoids a DB lookup on each token verification, improves cold start):
```ts
export default {
  providers: [getAuthConfigProvider({ jwks: process.env.JWKS })],
} satisfies AuthConfig;
```

Generate and set the static JWKS:
```bash
npx convex run auth:generateJwk | npx convex env set JWKS
```

## Step 4: Create `convex/auth.ts`

```ts
import { betterAuth } from "better-auth/minimal";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import betterAuthSchema from "./betterAuth/schema";
import authConfig from "./auth.config";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { BetterAuthOptions } from "better-auth/minimal";
import type { DataModel } from "./_generated/dataModel";

export const authComponent = createClient<DataModel, typeof betterAuthSchema>(
  components.betterAuth,
  {
    authFunctions: internal.auth,
    local: { schema: betterAuthSchema },
  }
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
export const { getAuthUser } = authComponent.clientApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true },
    plugins: [convex({ authConfig })],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));
```

### With Triggers (user created/updated/deleted callbacks)

Triggers let you run app-level mutations when Better Auth creates, updates, or deletes auth records. Common use: creating an app-level `users` record when a new auth user is created.

```ts
export const authComponent = createClient<DataModel, typeof betterAuthSchema>(
  components.betterAuth,
  {
    authFunctions: internal.auth,
    local: { schema: betterAuthSchema },
    triggers: {
      user: {
        onCreate: async (ctx, authUser) => {
          // authUser has: _id, email, name, emailVerified, createdAt, updatedAt, etc.
          const userId = await ctx.db.insert("users", {
            email: authUser.email,
            name: authUser.name,
            authUserId: authUser._id,
            createdAt: Date.now(),
          });
          // Link back: set userId on the Better Auth user record
          await authComponent.setUserId(ctx, authUser._id, userId);
        },
        onDelete: async (ctx, authUser) => {
          const user = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
            .unique();
          if (user) await ctx.db.delete("users", user._id);
        },
      },
    },
  }
);
```

Triggers require `authFunctions: internal.auth` — the `triggersApi()` exports (`onCreate`, `onUpdate`, `onDelete`) must be exported from the same module.

## Step 5: Register HTTP Routes

In `convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth);
export default http;
```

This registers all Better Auth endpoints under `/api/auth/` and the JWKS/OpenID endpoints needed for Convex JWT validation.

### CORS (cross-domain deployments)

```ts
authComponent.registerRoutes(http, createAuth, { cors: true });
```

## Step 6: Set Environment Variables

### Backend (set with `npx convex env set`)

- `BETTER_AUTH_SECRET` — random secret, generate with `openssl rand -base64 32`
- `SITE_URL` — full URL of your frontend, e.g. `http://localhost:3000`
- `SUPER_ADMIN_EMAIL` — (optional) first super-admin email
- `JWKS` — (optional) static JWKS for production (see Step 3)

### Frontend (in `.env.local`)

- `VITE_CONVEX_URL` — from Convex dashboard (ends in `.convex.cloud`)
- `VITE_CONVEX_SITE_URL` — from Convex dashboard (ends in `.convex.site`)

`CONVEX_SITE_URL` is automatically available inside Convex backend functions. For TanStack Start SSR, it must also be set in the environment.

## Step 7: Frontend Auth Client

```ts
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});
```

The `convexClient()` plugin handles exchanging Better Auth sessions for Convex JWTs. It intercepts sign-in/sign-up responses to set a `convex_jwt` cookie used by the TanStack Start SSR adapter.

### With Better Auth Admin Plugin

```ts
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient(), adminClient()],
});
```

## Step 8: ConvexBetterAuthProvider (React / TanStack Start)

The component provides a `ConvexBetterAuthProvider` for React apps. For TanStack Start SSR, use the `convexBetterAuthReactStart` helper from `@convex-dev/better-auth/react-start`.

### TanStack Start SSR Token Retrieval

```ts
// src/lib/auth-server.ts
import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

export const { handler, getToken } = convexBetterAuthReactStart({
  convexUrl: process.env.VITE_CONVEX_URL!,
  convexSiteUrl: process.env.VITE_CONVEX_SITE_URL!,
});
```

`getToken` is called on the server to fetch a JWT for the current session (using `getRequestHeaders()` from TanStack Start). `handler` forwards auth API requests to the Convex site URL.

Wire the handler in the TanStack Start API route (e.g. `src/routes/api/auth/$.ts`):

```ts
import { handler } from "~/lib/auth-server";
export const APIRoute = (event: any) => handler(event.request);
```

## Protecting Backend Functions

Better Auth stores user identity in the Convex JWT. The standard pattern:

```ts
import { authComponent } from "./auth";

// Returns null if not authenticated — safe for queries that should return empty data
const authUser = await authComponent.safeGetAuthUser(ctx);

// Throws ConvexError("Unauthenticated") if not authenticated
const authUser = await authComponent.getAuthUser(ctx);
```

For apps with a separate `users` table linked via `userId` on the Better Auth user record:

```ts
export const getUser = async (ctx: QueryCtx) => {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser?.userId) throw new ConvexError("Unauthenticated");
  const user = await ctx.db.get("users", authUser.userId as Id<"users">);
  if (!user) throw new ConvexError("User not found");
  return user;
};
```

**Do not use** `ctx.auth.getUserIdentity()` directly for Better Auth — use `authComponent.safeGetAuthUser` or `authComponent.getAuthUser` instead.

## Available `authComponent` Methods

- `authComponent.adapter(ctx)` — Convex DB adapter for use in `createAuthOptions`
- `authComponent.getAuthUser(ctx)` — current user or throws
- `authComponent.safeGetAuthUser(ctx)` — current user or null
- `authComponent.getAnyUserById(ctx, id)` — look up a Better Auth user by ID
- `authComponent.setUserId(ctx, authId, userId)` — link a Better Auth user to an app user ID (use in `onCreate` trigger)
- `authComponent.getAuth(createAuth, ctx)` — get Better Auth API + request headers for calling Better Auth API methods in Convex functions
- `authComponent.getHeaders(ctx)` — get headers with Bearer token for current session
- `authComponent.clientApi()` — exports `getAuthUser` as a Convex query (for `ClientAuthBoundary`)
- `authComponent.triggersApi()` — exports `onCreate`, `onUpdate`, `onDelete` internal mutations
- `authComponent.registerRoutes(http, createAuth, opts?)` — register Better Auth HTTP routes

## Better Auth Plugins in Convex Auth Options

Add Better Auth plugins to `createAuthOptions`. The `convex` plugin is always required:

```ts
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins";

plugins: [
  convex({ authConfig }),          // required — Convex JWT integration
  admin(),                          // Better Auth admin plugin (ban, impersonate, role)
  // twoFactor(), magicLink(), etc.
]
```

The `convex` plugin options:
- `authConfig` — required, from `convex/auth.config.ts`
- `jwks` — optional static JWKS string for production
- `jwksRotateOnTokenGenerationError` — default `true`, auto-rotates JWKS on algorithm mismatch (useful for upgrades)
- `jwt.expirationSeconds` — JWT TTL, default 900 (15 min)
- `jwt.definePayload` — customize JWT payload fields

## Gotchas

- **`convex/betterAuth/adapter.ts`**: This file must re-export from `@convex-dev/better-auth`. Check `node_modules/@convex-dev/better-auth/src/component/adapter.ts` for the expected export shape if needed. It's commonly just a thin re-export.
- **Schema regeneration**: Add `npx @better-auth/cli generate` to your setup flow whenever you add/remove Better Auth plugins. The schema in `convex/betterAuth/schema.ts` must match the active plugins.
- **CONVEX_SITE_URL vs VITE_CONVEX_URL**: `CONVEX_SITE_URL` ends in `.convex.site` and is the HTTP actions URL. `VITE_CONVEX_URL` ends in `.convex.cloud` and is the WebSocket/query URL. Both are required.
- **`SITE_URL` in Better Auth options**: Must be the frontend URL, not the Convex site URL. Used for CORS and redirect validation.
- **TanStack Start**: Better Auth cookies are set on the `.convex.site` domain. The `convexBetterAuthReactStart` helper reads the `convex_jwt` cookie via `getRequestHeaders()` on the server side. If SSR auth is broken, check that `VITE_CONVEX_SITE_URL` is set correctly in `.env.local`.
- **After sign-in navigation in TanStack Start**: Use `window.location.href = "/"` rather than router navigation after sign-in to bust the React server cache. `router.navigate()` may serve a stale cached page where the session has not yet propagated.
- **`triggersApi()` exports must be in the same file**: `onCreate`, `onUpdate`, `onDelete` from `authComponent.triggersApi()` must be exported from the module referenced by `authFunctions: internal.auth`.
- **`setUserId` is deprecated in 0.9**: Still works; prefer using the `userId` field directly when possible.
- **Auth tables are isolated in the component**: Do not write to Better Auth tables (user, session, account, etc.) directly with `ctx.db`. Use `ctx.runMutation(components.betterAuth.adapter.updateOne, ...)` if you must write from outside a trigger.
- **Rate limiting**: Better Auth's rate limit plugin uses the `rateLimit` table in the component schema. It requires no extra setup; it's included in the generated schema.

## Production Checklist

- [ ] `BETTER_AUTH_SECRET` set in Convex dashboard (not just `.env.local`)
- [ ] `SITE_URL` set to the production frontend URL in Convex dashboard
- [ ] `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` set in hosting platform env vars
- [ ] Static JWKS generated and set (`npx convex run auth:generateJwk | npx convex env set JWKS`) for production
- [ ] `auth.config.ts` uses `getAuthConfigProvider({ jwks: process.env.JWKS })` for production
- [ ] OAuth provider redirect URLs updated to production domain
- [ ] `trustedOrigins` in Better Auth options includes production domain if cross-domain

## Validation Checklist

- [ ] User can sign up with email/password
- [ ] User can sign in and Convex-authenticated queries succeed
- [ ] `authComponent.safeGetAuthUser(ctx)` returns the user in a backend function
- [ ] Sign-out clears the session
- [ ] Protected routes redirect unauthenticated users
- [ ] Trigger `onCreate` fires and creates the app-level user record (if using triggers)
- [ ] `authUser.userId` is set after `setUserId` call in `onCreate` trigger
