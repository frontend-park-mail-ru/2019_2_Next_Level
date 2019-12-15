const CACHE = 'offline-fallback-v1';
const OFLINE_PAGE = 'ofline.html';

self.addEventListener('install', (event) => {
	console.log('SW:Install');
	event.waitUntil((() => caches.open(CACHE)
			.then(cache => cache.add(new Request(OFLINE_PAGE, {cache: 'reload'})))
		// cache.add(new Request(OFLINE_PAGE, {cache: 'reload'}));
	)());
});
// При установке воркера мы должны закешировать часть данных (статику).
// self.addEventListener('install', (event) => {
// 	console.log('SW:Install');
// 	event.waitUntil(
// 		caches
// 			.open(CACHE)
// 			.then((cache) => {return cache.addAll(['/static/'])})
// 			// `skipWaiting()` необходим, потому что мы хотим активировать SW
// 			// и контролировать его сразу, а не после перезагрузки.
// 			.then(() => self.skipWaiting()).then(console.log('SW: Installed')).catch(err => console.log('SW:err ', err))
// 	);
// });



self.addEventListener('activate', (event) => {
	console.log('SW:Activate');
	// `self.clients.claim()` позволяет SW начать перехватывать запросы с самого начала,
	// это работает вместе с `skipWaiting()`, позволяя использовать `fallback` с самых первых запросов.
	event.waitUntil(self.clients.claim());
});

// self.addEventListener('fetch', function(event) {
// 	// Можете использовать любую стратегию описанную выше.
// 	// Если она не отработает корректно, то используейте `Embedded fallback`.
// 	console.log('SW:Fetch');
// 	event.respondWith(networkOrCache(event.request)
// 		.catch(() => useFallback()));
// });

function networkOrCache(request) {
	console.log('networkCache');
	return fetch(request)
		.then((response) => response.ok ? response : fromCache(request))
		.catch(() => fromCache(request));
}

self.addEventListener('fetch', (event) => {
	// We only want to call event.respondWith() if this is a navigation request
	// for an HTML page.
	console.log("SW: fetch");
	if (event.request.mode === 'navigate') {
		event.respondWith((async () => {
			try {
				// First, try to use the navigation preload response if it's supported.
				const preloadResponse = await event.preloadResponse;
				if (preloadResponse) {
					return preloadResponse;
				}

				const networkResponse = await fetch(event.request);
				return networkResponse;
			} catch (error) {
				// catch is only triggered if an exception is thrown, which is likely
				// due to a network error.
				// If fetch() returns a valid HTTP response with a response code in
				// the 4xx or 5xx range, the catch() will NOT be called.
				console.log('Fetch failed; returning offline page instead.', error);

				const cache = await caches.open(CACHE);
				const cachedResponse = await cache.match(OFLINE_PAGE);
				return cachedResponse;
			}
		})());
	}

	// If our if() condition is false, then this fetch handler won't intercept the
	// request. If there are any other fetch handlers registered, they will get a
	// chance to call event.respondWith(). If no fetch handlers call
	// event.respondWith(), the request will be handled by the browser as if there
	// were no service worker involvement.
});

// Наш Fallback вместе с нашим собсвенным Динозавриком.
const FALLBACK =
	'<div>\n' +
	'    <div>App Title</div>\n' +
	'    <div>you are offline</div>\n' +
	'    ' +
	'</div>';

// Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
function useFallback() {
	console.log('SW:useFallBack');
	// const cache = await caches.open(CACHE);
	// const cachedResponse = await cache.match(OFLINE_PAGE);
	// return cachedResponse;
	return Promise.resolve(new Response(FALLBACK, { headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}}));
}

function fromCache(request) {
	console.log('fromCache');
	return caches.open(CACHE).then((cache) =>
		cache.match(request).then((matching) =>
			matching || Promise.reject('no-match')
		));
}

// При запросе на сервер мы используем данные из кэша и только после идем на сервер.
// self.addEventListener('fetch', (event) => {
// 	// Как и в предыдущем примере, сначала `respondWith()` потом `waitUntil()`
// 	event.respondWith(fromCache(event.request));
// 	event.waitUntil(
// 		update(event.request)
// 		// В конце, после получения "свежих" данных от сервера уведомляем всех клиентов.
// 			.then(refresh)
// 	);
// });

// function update(request) {
// 	return caches.open(CACHE).then((cache) =>
// 		fetch(request).then((response) =>
// 			cache.put(request, response.clone()).then(() => response)
// 		)
// 	);
// }

// Шлём сообщения об обновлении данных всем клиентам.
// function refresh(response) {
// 	return self.clients.matchAll().then((clients) => {
// 		clients.forEach((client) => {
// 			const message = {
// 				type: 'refresh',
// 				url: response.url,
// 				eTag: response.headers.get('ETag')
// 			};
// 			// Уведомляем клиент об обновлении данных.
// 			client.postMessage(JSON.stringify(message));
// 		});
// 	});
// }