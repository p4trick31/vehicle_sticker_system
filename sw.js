self.addEventListener("push", function(event) {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon,
    data: { url: data.url } // To navigate on click
  };

  event.waitUntil(
    self.registration.showNotification(data.head, options)
  );
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
