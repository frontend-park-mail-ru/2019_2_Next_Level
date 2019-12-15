const CACHE = 'offline-fallback-v1';

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
	console.log('SW:Install');
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(['/static/']))
			// `skipWaiting()` необходим, потому что мы хотим активировать SW
			// и контролировать его сразу, а не после перезагрузки.
			.then(() => self.skipWaiting()).then(console.log('SW: Installed'))
	);
});

self.addEventListener('activate', (event) => {
	console.log('SW:Activate');
	// `self.clients.claim()` позволяет SW начать перехватывать запросы с самого начала,
	// это работает вместе с `skipWaiting()`, позволяя использовать `fallback` с самых первых запросов.
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
	// Можете использовать любую стратегию описанную выше.
	// Если она не отработает корректно, то используейте `Embedded fallback`.
	console.log('SW:Fetch');
	event.respondWith(networkOrCache(event.request)
		.catch(() => useFallback()));
});

function networkOrCache(request) {
	return fetch(request)
		.then((response) => response.ok ? response : fromCache(request))
		.catch(() => fromCache(request));
}

// Наш Fallback вместе с нашим собсвенным Динозавриком.
const FALLBACK =
	'<div>\n' +
	'    <div>App Title</div>\n' +
	'    <div>you are offline</div>\n' +
	'    <img src="/svg/or/base64/of/your/dinosaur" alt="dinosaur"/>\n' +
	'</div>';

// Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
function useFallback() {
	return Promise.resolve(new Response(FALLBACK, { headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}}));
}

function fromCache(request) {
	return caches.open(CACHE).then((cache) =>
		cache.match(request).then((matching) =>
			matching || Promise.reject('no-match')
		));
}

// При запросе на сервер мы используем данные из кэша и только после идем на сервер.
self.addEventListener('fetch', (event) => {
	// Как и в предыдущем примере, сначала `respondWith()` потом `waitUntil()`
	event.respondWith(fromCache(event.request));
	event.waitUntil(
		update(event.request)
		// В конце, после получения "свежих" данных от сервера уведомляем всех клиентов.
			.then(refresh)
	);
});

function update(request) {
	return caches.open(CACHE).then((cache) =>
		fetch(request).then((response) =>
			cache.put(request, response.clone()).then(() => response)
		)
	);
}

// Шлём сообщения об обновлении данных всем клиентам.
function refresh(response) {
	return self.clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			const message = {
				type: 'refresh',
				url: response.url,
				eTag: response.headers.get('ETag')
			};
			// Уведомляем клиент об обновлении данных.
			client.postMessage(JSON.stringify(message));
		});
	});
}