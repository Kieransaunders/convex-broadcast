---
name: convex
description: |
  Backend development with Convex - a reactive database platform with TypeScript support. Use this skill when:
  - Creating or modifying Convex functions (queries, mutations, actions)
  - Defining or updating Convex schemas and indexes
  - Working with files in a convex/ directory
  - Building React apps that use useQuery, useMutation, or useAction hooks
  - Setting up real-time data subscriptions
  - Implementing file storage, scheduling, or authentication with Convex
  - Troubleshooting Convex TypeScript errors or query patterns
  Triggers: convex, useQuery, useMutation, useAction, ctx.db, v.string(), v.object(), defineSchema, defineTable
---

# Convex

Convex is a reactive backend platform providing database, serverless functions, and real-time sync with end-to-end TypeScript type safety.

## Quick Reference

### Project Structure
```
convex/
├── _generated/        # Auto-generated (never edit)
├── schema.ts          # Database schema
├── http.ts            # HTTP endpoints (optional)
└── [yourFunctions].ts # Queries, mutations, actions
```

### Function Types

| Type | Use For | Can Access DB | Can Call External APIs |
|------|---------|---------------|------------------------|
| `query` | Read data | Yes (read) | No |
| `mutation` | Write data | Yes (read/write) | No |
| `action` | External APIs | No (use runQuery/runMutation) | Yes |

## Core Patterns

### 1. Schema Definition

Always define schemas in `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  })
    .index("by_email", ["email"])
    .index("by_role_and_name", ["role", "name"]),

  messages: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    channelId: v.id("channels"),
  })
    .index("by_channel", ["channelId"]),
});
```

**Index naming**: Always include all index fields in the name: `by_field1_and_field2`.
**Index order**: Fields must be queried in definition order. Create separate indexes for different query orders.

### 2. Query Functions

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUser = query({
  args: { userId: v.id("users") },
  returns: v.union(v.null(), v.object({
    _id: v.id("users"),
    name: v.string(),
    email: v.string(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Query with index - ALWAYS use indexes, never filter()
export const getUsersByRole = query({
  args: { role: v.string() },
  returns: v.array(v.object({ _id: v.id("users"), name: v.string() })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role_and_name", (q) => q.eq("role", args.role))
      .collect();
  },
});
```

**Critical**: Never use `.filter()` - always define indexes and use `.withIndex()`.

### 3. Mutation Functions

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string()
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "user",
    });
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { name: args.name });
    return null;
  },
});
```

- `ctx.db.replace(id, { ... })` — fully replace a document (throws if not found)
- `ctx.db.patch(id, { ... })` — shallow merge updates (throws if not found)

### 4. Action Functions (External APIs)

```typescript
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const sendEmail = action({
  args: { userId: v.id("users"), subject: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUser, {
      userId: args.userId
    });
    await fetch("https://api.email.com/send", {
      method: "POST",
      body: JSON.stringify({ to: user.email, subject: args.subject }),
    });
    return null;
  },
});
```

- Add `"use node";` at top of files using Node.js built-in modules
- **Never** add `"use node";` to files that also export queries or mutations — put actions in separate files
- `fetch()` is available in the default runtime — no `"use node";` needed for fetch
- Actions **cannot** use `ctx.db` — use `ctx.runQuery`/`ctx.runMutation`

### 5. React Integration

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function UserList() {
  const users = useQuery(api.users.list);
  const createUser = useMutation(api.users.create);

  if (users === undefined) return <div>Loading...</div>;

  return (
    <div>
      {users.map(user => <div key={user._id}>{user.name}</div>)}
      <button onClick={() => createUser({ name: "New User" })}>
        Add User
      </button>
    </div>
  );
}
```

## HTTP Endpoints

Defined in `convex/http.ts` with `httpAction` decorator:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
const http = httpRouter();
http.route({
    path: "/echo",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const body = await req.bytes();
        return new Response(body, { status: 200 });
    }),
});
```

Endpoints are registered at the exact path specified in the `path` field.

## Validators Reference

### All Valid Convex Types

| Convex Type | TS/JS type | Validator | Notes |
|-------------|-----------|-----------|-------|
| Id | string | `v.id(tableName)` | |
| Null | null | `v.null()` | `undefined` is NOT valid. Use `null`. |
| Int64 | bigint | `v.int64()` | BigInts between -2^63 and 2^63-1 |
| Float64 | number | `v.number()` | IEEE-754 double-precision |
| Boolean | boolean | `v.boolean()` | |
| String | string | `v.string()` | UTF-8, must be < 1MB |
| Bytes | ArrayBuffer | `v.bytes()` | Must be < 1MB |
| Array | Array | `v.array(values)` | Max 8192 values |
| Object | Object | `v.object({property: value})` | Max 1024 entries. Fields can't start with "$" or "_" |
| Record | Record | `v.record(keys, values)` | Keys must be ASCII, nonempty, not start with "$" or "_" |
| Optional | — | `v.optional(v)` | |
| Union | — | `v.union(v, v)` | |
| Literal | — | `v.literal(val)` | |
| Any | — | `v.any()` | |

### Discriminated Union Schema Example
```typescript
export default defineSchema({
    results: defineTable(
        v.union(
            v.object({
                kind: v.literal("error"),
                errorMessage: v.string(),
            }),
            v.object({
                kind: v.literal("success"),
                value: v.number(),
            }),
        ),
    )
});
```

## Function Registration Rules

- Use `internalQuery`, `internalMutation`, `internalAction` for private functions (only callable by other Convex functions). Import from `./_generated/server`.
- Use `query`, `mutation`, `action` for public functions (exposed to the Internet). Do NOT use these for sensitive internal functions.
- You CANNOT register a function through the `api` or `internal` objects.
- **ALWAYS include argument validators** for ALL Convex functions.

## Function Calling Rules

- `ctx.runQuery` — call a query from a query, mutation, or action
- `ctx.runMutation` — call a mutation from a mutation or action
- `ctx.runAction` — call an action from an action
- **ONLY** call an action from another action if you need to cross runtimes (e.g. V8 to Node). Otherwise, extract shared code into a helper async function.
- Minimize calls from actions to queries/mutations. Each is a separate transaction — splitting introduces race conditions.
- All calls take a `FunctionReference`. Do NOT pass the callee function directly.
- When calling a function in the same file, specify a type annotation on the return value to work around TypeScript circularity:
```typescript
export const g = query({
  args: {},
  handler: async (ctx, args) => {
    const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });
    return null;
  },
});
```

## Function References

- Use `api` object from `convex/_generated/api.ts` for public functions
- Use `internal` object from `convex/_generated/api.ts` for internal functions
- File-based routing: `convex/example.ts` function `f` → `api.example.f`
- Internal function `g` in `convex/example.ts` → `internal.example.g`
- Nested: `convex/messages/access.ts` function `h` → `api.messages.access.h`

## Pagination

```ts
import { paginationOptsValidator } from "convex/server";
export const listWithExtraArg = query({
    args: { paginationOpts: paginationOptsValidator, author: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
        .query("messages")
        .withIndex("by_author", (q) => q.eq("author", args.author))
        .order("desc")
        .paginate(args.paginationOpts);
    },
});
```
- `paginationOpts` contains: `numItems` (number), `cursor` (string | null)
- `.paginate()` returns: `page` (array), `isDone` (boolean), `continueCursor` (string)

## Schema Guidelines

- Always define schema in `convex/schema.ts`
- Import schema definition functions from `convex/server`
- System fields (`_creationTime` with `v.number()`, `_id` with `v.id(tableName)`) are auto-added
- Include all index fields in the index name: `by_field1_and_field2`
- Index fields must be queried in definition order. Create separate indexes for different query orders.

## Authentication Guidelines

- Convex supports JWT-based auth through `convex/auth.config.ts`. ALWAYS create this file when using auth.
- Example `convex/auth.config.ts`:
```typescript
export default {
  providers: [
    {
      domain: "https://your-auth-provider.com",
      applicationID: "convex",
    },
  ],
};
```
- `ctx.auth.getUserIdentity()` returns `null` if unauthenticated, or a `UserIdentity` object with `subject`, `issuer`, `name`, `email`, etc.
- **NEVER accept a `userId` as a function argument for auth**. Always derive identity server-side via `ctx.auth.getUserIdentity()`.
- Use `ConvexProviderWithAuth` (not `ConvexProvider`) when auth is needed:
```tsx
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
function App({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useYourAuthHook}>
      {children}
    </ConvexProviderWithAuth>
  );
}
```

## TypeScript Guidelines

- Use `Id<'tableName'>` from `./_generated/dataModel` for document IDs
- Use `Doc<"tableName">` for full document types
- Use `QueryCtx`, `MutationCtx`, `ActionCtx` from `./_generated/server` for context types. NEVER use `any` for ctx.
- For `v.record(v.id('users'), v.string())` use type `Record<Id<'users'>, string>`
- Be strict with ID types: use `Id<'users'>` rather than `string`

## Query Guidelines

- Do NOT use `filter` — define an index and use `withIndex`
- No `.delete()` on queries — `.collect()` then iterate with `ctx.db.delete(row._id)`
- Use `.unique()` for single document (throws if multiple match)
- With async iteration, don't use `.collect()` or `.take(n)` — use `for await (const row of query)`
- Default order is ascending `_creationTime`
- Use `.order('asc')` or `.order('desc')` to specify order

## Full Text Search

```typescript
const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);
```

## Scheduling & Cron Jobs

- Only use `crons.interval` or `crons.cron` methods. Do NOT use `crons.hourly`, `crons.daily`, `crons.weekly`.
- Both take a `FunctionReference` — don't pass the function directly.
- Pattern:
```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
const crons = cronJobs();
crons.interval("job name", { hours: 2 }, internal.crons.myFunction, {});
export default crons;
```
- Always import `internal` from `_generated/api` even for functions in the same file.

## File Storage

- `ctx.storage.getUrl()` returns a signed URL (or `null` if file doesn't exist)
- Do NOT use deprecated `ctx.storage.getMetadata` — query the `_storage` system table:
```ts
const metadata = await ctx.db.system.get(args.fileId);
```
- Convex storage uses `Blob` objects — convert to/from `Blob` when using storage.

## Critical Rules

1. **Always include `args` validators** on all functions
2. **Never use `.filter()`** - define indexes and use `.withIndex()`
3. **Actions cannot access `ctx.db`** - use `ctx.runQuery`/`ctx.runMutation`
4. **Keep `npx convex dev` running** - it generates types automatically
5. **Query index fields in definition order** - you can't skip fields
6. **Return `null` not `undefined`** - undefined is not a valid Convex value
7. **Never add `"use node";` to files with queries/mutations** - put actions in separate files
8. **Never accept userId as function argument for auth** - derive from `ctx.auth.getUserIdentity()`
9. **Use FunctionReferences (`api`/`internal`)** - never pass functions directly to `ctx.runQuery` etc.
10. **Minimize action-to-query/mutation calls** - each is a separate transaction with race condition risk

## ⚠️ Convex CLI Safety Rules (CRITICAL)

**NEVER run `npx convex run --prod` on destructive mutations without explicit user confirmation.**

Lessons learned from a production incident:

- `npx convex run --prod` runs against the **live production database** immediately — there is no dry-run or undo.
- Mutations named `wipeTestData`, `seed`, `reset`, `deleteAll`, etc. are **permanently destructive** even if they sound like dev utilities.
- **Before running any `npx convex run --prod` command**, read the function's handler code and confirm with the user what it will do.
- **Never run an unknown function** just to "test CLI connectivity" — use a known read-only query instead (e.g. `npx convex run --prod systemStats:getSomeStats`).
- Internal mutations (`internalMutation`) bypass auth context and can operate on all data — treat them with extra caution on prod.

### Safe pattern for seeding screenshot data

When you need to seed data for screenshots or demos on a **live app**:
1. Use the browser UI (Playwright) to create data as an authenticated user — mutations enforce auth context and scope.
2. OR write a temporary `internalMutation` seed function, deploy it, confirm with the user, run it, then delete it.
3. **Do NOT repurpose existing admin/wipe functions** as a shortcut.

### Safe CLI commands

```bash
# Safe — read only
npx convex run --prod someModule:someQuery

# Requires explicit confirmation before running — modifies data
npx convex run --prod someModule:someMutation --args '{...}'

# DANGER — verify the handler does not delete/wipe before running
npx convex run --prod admin:anyAdminFunction
```

## Full Example: Chat App with AI

A complete real-time chat backend with user management, channels, messaging, and AI response generation.

### convex/schema.ts
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({
    name: v.string(),
  }),

  users: defineTable({
    name: v.string(),
  }),

  messages: defineTable({
    channelId: v.id("channels"),
    authorId: v.optional(v.id("users")),
    content: v.string(),
  }).index("by_channel", ["channelId"]),
});
```

### convex/index.ts
```typescript
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

export const createUser = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", { name: args.name });
  },
});

export const createChannel = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("channels", { name: args.name });
  },
});

export const listMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
    return messages;
  },
});

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");
    const user = await ctx.db.get(args.authorId);
    if (!user) throw new Error("User not found");

    await ctx.db.insert("messages", {
      channelId: args.channelId,
      authorId: args.authorId,
      content: args.content,
    });
    await ctx.scheduler.runAfter(0, internal.index.generateResponse, {
      channelId: args.channelId,
    });
    return null;
  },
});

const openai = new OpenAI();

export const generateResponse = internalAction({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(internal.index.loadContext, {
      channelId: args.channelId,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: context,
    });
    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");

    await ctx.runMutation(internal.index.writeAgentResponse, {
      channelId: args.channelId,
      content,
    });
    return null;
  },
});

export const loadContext = internalQuery({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);

    const result = [];
    for (const message of messages) {
      if (message.authorId) {
        const user = await ctx.db.get(message.authorId);
        if (!user) throw new Error("User not found");
        result.push({
          role: "user" as const,
          content: `${user.name}: ${message.content}`,
        });
      } else {
        result.push({ role: "assistant" as const, content: message.content });
      }
    }
    return result;
  },
});

export const writeAgentResponse = internalMutation({
  args: {
    channelId: v.id("channels"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      channelId: args.channelId,
      content: args.content,
    });
    return null;
  },
});
```

This example demonstrates:
- Public vs internal function registration
- Using `ctx.scheduler.runAfter` for async background work
- Action calling internal query/mutation via `ctx.runQuery`/`ctx.runMutation`
- Proper use of `internal` function references
- Index-based queries with ordering
- Optional fields (`authorId`) for system-generated messages

## References

For detailed patterns, see:
- [functions.md](references/functions.md) - Complete function patterns and context API
- [database.md](references/database.md) - Schema, indexes, reading/writing data
- [react.md](references/react.md) - React hooks and client setup
- [convex_rules.md](references/convex_rules.md) - Full rules reference
