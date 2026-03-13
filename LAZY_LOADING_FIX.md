# Fix Mobile Performance with Lazy Loading

## Option 1: Convert Routes to Lazy (Recommended)

Rename route files from `.tsx` to `.lazy.tsx`:

```bash
# Admin routes (heavy, not needed for most users)
mv src/routes/_authed/_admin/dashboard.tsx src/routes/_authed/_admin/dashboard.lazy.tsx
mv src/routes/_authed/_admin/users/index.tsx src/routes/_authed/_admin/users/index.lazy.tsx
mv src/routes/_authed/_admin/messages/index.tsx src/routes/_authed/_admin/messages/index.lazy.tsx
mv src/routes/_authed/_admin/events/index.tsx src/routes/_authed/_admin/events/index.lazy.tsx
mv src/routes/_authed/_admin/groups/index.tsx src/routes/_authed/_admin/groups/index.lazy.tsx

# Detail pages (loaded on demand)
mv src/routes/_authed/messages.\$id.tsx src/routes/_authed/messages.\$id.lazy.tsx
mv src/routes/_authed/_admin/messages/detail.tsx src/routes/_authed/_admin/messages/detail.lazy.tsx
mv src/routes/_authed/_admin/events/detail.tsx src/routes/_authed/_admin/events/detail.lazy.tsx
mv src/routes/_authed/_admin/groups/detail.tsx src/routes/_authed/_admin/groups/detail.lazy.tsx

# Other heavy pages
mv src/routes/_authed/settings.tsx src/routes/_authed/settings.lazy.tsx
```

Then regenerate the route tree:
```bash
npm run dev  # or npx tsr generate
```

## Option 2: Add Preload Strategy

In router.tsx:
```ts
const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // Preload on hover/focus
  defaultPreloadStaleTime: 30_000,
  // ... rest
})
```

## Option 3: Service Worker Optimization

Already done - caches critical routes.

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Main Bundle | 512KB | ~150KB |
| Time to Interactive | 3-5s | <1s |
| Admin Bundle | In main | Loaded on demand |

## Quick Win (Do This Now)

Add this to `vite.config.ts`:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Split heavy dependencies
        'vendor': ['react', 'react-dom'],
        'router': ['@tanstack/react-router'],
        'query': ['@tanstack/react-query'],
        'convex': ['convex', '@convex-dev/react-query'],
        'ui': ['@base-ui/react'], // If using base-ui
      }
    }
  }
}
```
