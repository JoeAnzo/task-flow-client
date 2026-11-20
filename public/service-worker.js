self.addEventListener("push", (event) => {
  let payload = {}

  if (event.data) {
    try {
      payload = event.data.json()
    } catch {
      payload = { body: event.data.text() }
    }
  }

  const title = payload.head || payload.title || "TaskFlow reminder"
  const options = {
    body: payload.body || "You have a reminder.",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    data: { url: payload.url || "/" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const requestedUrl = new URL(event.notification.data?.url || "/", self.location.origin)
  const targetUrl = requestedUrl.origin === self.location.origin
    ? requestedUrl
    : new URL("/", self.location.origin)

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          await client.navigate(targetUrl.href)
          return client.focus()
        }
      }

      return self.clients.openWindow(targetUrl.href)
    }),
  )
})
