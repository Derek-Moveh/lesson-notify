const CACHE_NAME = 'lesson-notify-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

self.addEventListener('push', (event) => {
    let payload = { title: 'Lesson Notify', body: 'You have a new notification.' };
    try {
        if (event.data) payload = event.data.json();
    } catch (err) {
        payload.body = event.data ? event.data.text() : payload.body;
    }

    event.waitUntil(
        self.registration.showNotification(payload.title || 'Lesson Notify', {
            body: payload.body || '',
            tag: payload.tag || 'lesson-notify-alert',
            data: { url: payload.url || '/' }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});