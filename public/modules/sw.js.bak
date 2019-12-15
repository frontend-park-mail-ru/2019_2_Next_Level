const { assets } = global.serviceWorkerOption;
const cacheName = 'myCache';

let assetsToCache = [...assets, './'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(cacheName).then((cache) => {
			cache.addAll(assetsToCache);
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((cachedResponse) => {
				if (cachedResponse && !navigator.onLine) {
					return cachedResponse;
				}

				return fetch(event.request)
					.then((response) => {
						return caches.open(cacheName).then((cache) => {
							cache.put(event.request, response.clone());
							return response;
						});
					});
			})
	);
});
