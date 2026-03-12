self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "New Message", {
      body: data.body ?? "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/feed" },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? "/feed"
  event.waitUntil(clients.openWindow(url))
})

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})
