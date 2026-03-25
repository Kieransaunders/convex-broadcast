const CACHE_NAME = "orgcomms-v3";
// Precache critical routes for offline access
const PRECACHE_URLS = ["/", "/inbox", "/settings", "/sign-in"];

// Install: precache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: clean old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => clients.claim()),
  );
});

// Fetch: network-first for navigations, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin))
    return;

  // Skip API/auth requests
  if (
    request.url.includes("/api/") ||
    request.url.includes("/_server") ||
    request.url.includes("/convex")
  )
    return;

  // Skip Vite dev server module URLs (no content hash → become stale instantly)
  if (
    request.url.includes("/@") ||
    request.url.includes("/src/") ||
    request.url.includes("?v=") ||
    request.url.includes("?t=") ||
    self.location.hostname === "localhost"
  )
    return;

  // Navigation requests: network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache-first
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.url.match(/\.(js|css|png|jpg|svg|woff2?)(\?|$)/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          }),
      ),
    );
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch (e) {
    console.error("Failed to parse push data", e);
  }

  const url = data.url ?? "/inbox";
  const badgeCount = data.badgeCount ?? 0;

  event.waitUntil(
    Promise.all([
      // Show notification
      self.registration.showNotification(data.title ?? "New Message", {
        body: data.body ?? "",
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        data: { url },
        tag: url,
        renotify: true,
        vibrate: [100, 50, 100],
        actions: [{ action: "view", title: "View Message" }],
      }),
      // Update app badge if supported
      badgeCount > 0 && "setAppBadge" in self.navigator
        ? self.navigator.setAppBadge(badgeCount).catch(() => {})
        : Promise.resolve(),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/inbox";
  // Handle both direct click and "View Message" action button
  if (event.action === "" || event.action === "view") {
    event.waitUntil(
      Promise.all([
        clients.openWindow(url),
        // Clear badge when user clicks notification
        "clearAppBadge" in self.navigator
          ? self.navigator.clearAppBadge().catch(() => {})
          : Promise.resolve(),
      ]),
    );
  }
});

// Handle skip waiting message from client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
