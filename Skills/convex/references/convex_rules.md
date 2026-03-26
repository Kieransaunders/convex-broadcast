# Convex Rules & Guidelines

Authoritative rules for writing correct Convex code. Follow these strictly.

## Function Guidelines

### HTTP Endpoint Syntax
- HTTP endpoints are defined in `convex/http.ts` and require an `httpAction` decorator:
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
- Endpoints are registered at the exact path specified in the `path` field.

### Validators
- Array validator example:
```typescript
args: {
    simpleArray: v.array(v.union(v.string(), v.number())),
},
```
- Discriminated union schema example:
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

### Valid Convex Types

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

### Function Registration
- Use `internalQuery`, `internalMutation`, `internalAction` for private functions (only callable by other Convex functions). Import from `./_generated/server`.
- Use `query`, `mutation`, `action` for public functions (exposed to the Internet). Do NOT use these for sensitive internal functions.
- You CANNOT register a function through the `api` or `internal` objects.
- **ALWAYS include argument validators** for ALL Convex functions.

### Function Calling
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

### Function References
- Use `api` object from `convex/_generated/api.ts` for public functions
- Use `internal` object from `convex/_generated/api.ts` for internal functions
- File-based routing: `convex/example.ts` function `f` → `api.example.f`
- Internal function `g` in `convex/example.ts` → `internal.example.g`
- Nested: `convex/messages/access.ts` function `h` → `api.messages.access.h`

### Pagination
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

## Mutation Guidelines
- `ctx.db.replace(taskId, { ... })` — fully replace a document (throws if not found)
- `ctx.db.patch(taskId, { ... })` — shallow merge updates (throws if not found)

## Action Guidelines
- Add `"use node";` at top of files using Node.js built-in modules
- **Never** add `"use node";` to files that also export queries or mutations — put actions in separate files
- `fetch()` is available in the default runtime — no `"use node";` needed for fetch
- Actions cannot use `ctx.db` — use `ctx.runQuery`/`ctx.runMutation`

## Scheduling Guidelines

### Cron Jobs
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

## File Storage Guidelines
- `ctx.storage.getUrl()` returns a signed URL (or `null` if file doesn't exist)
- Do NOT use deprecated `ctx.storage.getMetadata` — query the `_storage` system table instead:
```ts
const metadata = await ctx.db.system.get(args.fileId);
```
- Convex storage uses `Blob` objects — convert to/from `Blob` when using storage.

## Full Text Search
```typescript
const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general"),
  )
  .take(10);
```

## Example: Chat App with AI

A complete example showing user management, channels, messaging, and AI response generation is available in the project docs at `docs/convex_rules.txt` (see the chat-app example section).
