// const DEBUG = true;
//
// const {assets} = global.serviceWorkerOption;
//
// const CACHE_NAME = 'aaa';
//
// const assetsToCache = [...assets, '/nl.svg', '/static/images/logo/svg',
// 				'/static/images/logo/nlmail.svg', '/static/images/icon/loupe.svg',
// 				'/index.html', '/main.js'];
//
// self.addEventListener('install', (event) => {
// 	// Perform install steps.
// 	if (DEBUG) {
// 		console.log('[SW] Install event');
// 	}
//
// 	// Add core website files to cache during serviceworker installation.
// 	event.waitUntil(
// 		global.caches
// 			.open(CACHE_NAME)
// 			.then((cache) => {
// 				console.log(assetsToCache);
// 				return cache.addAll(assetsToCache);
// 			})
// 			.then(() => {
// 				if (DEBUG) {
// 					console.log('Cached assets: main', assetsToCache);
// 				}
// 			})
// 			.catch((error) => {
// 				console.error(error);
// 				throw error;
// 			})
// 	);
// });
//
//
// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		caches
// 			.match(event.request)
// 			.then((cachedResponse) => {
// 				if (!navigator.onLine && cachedResponse) {
// 					return cachedResponse;
// 				}
//
// 				return fetch(event.request);
// 			})
// 	);
// });
const CACHE = 'offline-fallback-v1';

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(['/nl.svg', '/', '/static/images/logo/svg',
				'/static/images/logo/nlmail.svg', '/static/images/icon/loupe.svg', '/index.html', '/main.js']))
			// `skipWaiting()` необходим, потому что мы хотим активировать SW
			// и контролировать его сразу, а не после перезагрузки.
			// .then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	// `self.clients.claim()` позволяет SW начать перехватывать запросы с самого начала,
	// это работает вместе с `skipWaiting()`, позволяя использовать `fallback` с самых первых запросов.
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
	// Можете использовать любую стратегию описанную выше.
	// Если она не отработает корректно, то используейте `Embedded fallback`.
	event.respondWith(networkOrCache(event.request)
		.catch(() => useFallback()));
});

function networkOrCache(request) {
	console.log('NoC');
	return fetch(request)
		.then((response) => response.ok ? response : fromCache(request))
		.catch(() => fromCache(request));
}

// Наш Fallback вместе с нашим собсвенным Динозавриком.
const FALLBACK =
	'<div>\n' +
	'    <div>App Title</div>\n' +
	'    <div>you are offline</div>\n' +
	'    ' +
	'</div>';

// Он никогда не упадет, т.к мы всегда отдаем заранее подготовленные данные.
function useFallback() {
	console.log('Fall');
	// return Promise.resolve(new Response(FALLBACK, { headers: {
	// 		'Content-Type': 'text/html; charset=utf-8'
	// 	}}));
	return caches.open(CACHE).then(cache => cache.match('/index.html'));
}

function fromCache(request) {
	console.log('fromCache');
	return caches.open(CACHE).then((cache) =>
		cache.match(request).then((matching) =>
			matching || Promise.reject('no-match')
		));
}