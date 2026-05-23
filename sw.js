const CACHE = 'voltiq-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Network-first for HTML, cache-first for everything else
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});

// When user taps the notification, focus or open the app and trigger quick study
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) {
          c.focus();
          c.postMessage({ type: 'OPEN_QUICK_STUDY' });
          return;
        }
      }
      return clients.openWindow('./');
    })
  );
});
