import {ApplicationRenderState} from './application-utility.js';
import {Errors} from 'modules/errors.es6.inc.js';
import eventBus from 'modules/event-bus.js';
import {jsonize, fetchGet, consoleError} from 'modules/fetch.js';
import {partial} from 'modules/partial.js';
import router from 'modules/router.js';
import routes from 'modules/routes.js';
import storage from 'modules/storage';
import {UserInfo} from 'modules/userInfo';

export default class ApplicationModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.authorized = undefined;
		this.userInfo = new UserInfo();
		storage.set('userInfo', this.userInfo);
		storage.set('currentPage', '/messages/inbox');

		// this.renderState = ApplicationRenderState.NotRendered;
		//
		// routes.forEach(page => {
		// 	eventBus.addEventListener(`prerender:${page}`, partial(this.prerender, page));
		// });
		if ('serviceWorker' in navigator) {
			console.log('SW:exists');
			// Весь код регистрации у нас асинхронный.
			// debugger;
			// window.addEventListener('load', function() {
			// 	navigator.serviceWorker.register('/service-worker.js');
			// }
			navigator.serviceWorker.register('/sw.js')
				.then(() => {console.log('SW:1'); navigator.serviceWorker.ready.then((worker) => {
					console.log('SW:2');
					worker.sync.register('syncdata');
				})})
				.catch((err) => console.log('SW-err: ' + err));
		}
		console.log('SW:not after');
		console.log('Init application-model');
	}

	init = () => {
		this.renderState = ApplicationRenderState.NotRendered;

		routes.forEach(page => {
			eventBus.addEventListener(`prerender:${page}`, partial(this.prerender, page));
		});
		// clear
		eventBus.addEventListener('application:not-authorized', () => {
			storage.set('userInfo', new UserInfo());
		});
		eventBus.addEventListener('auth:authorized', () => this.loadUserData(), 10);
		eventBus.addEventListener('application:load_userdata', () => this.loadUserData());
	};

	/**
	 * Tries to GET /api/profile/get
	 */
	prerender = (toRender, data) => {
		if (this.authorized === !/auth/.test(toRender)) {
			console.log('AUTHORIZED');
			storage.set('currentPage', toRender);
			eventBus.emitEvent(`render:${toRender}`, data);
			return;
		}

		// авторизован и пошел на /auth/...
		// неавторизован и идешь в приватную часть
		jsonize(fetchGet('/api/profile/get')).then(response => {
			console.log("GET PROFILE ", toRender);
			if (response.status === 'ok') {

				this.authorized = true;
				storage.set('authState', true);
				const {userInfo} = response;
				// debugger;
				this.userInfo = new UserInfo(userInfo);
				storage.set('userInfo', this.userInfo);
				eventBus.emitEvent('application:authorized', this.userInfo);
				if (/auth/.test(toRender)) {
					let path = storage.get('currentPage');
					if (/auth/.test(path)) {
						path = '/messages/inbox';
						storage.set('currentPage', path);
					}
					return router.routeNew({}, '', path);
					// return router.routeNew({}, '', storage.get('currentPage'));
				}
			} else if (response.error.code === Errors.NotAuthorized.code) {
				this.authorized = false;
				storage.set('authState', false);
				eventBus.emitEvent('application:not-authorized');
				if (!/auth/.test(toRender)) {
					return router.routeNew({}, '', '/auth/sign-in');
				}
			} else {
				consoleError('Unknown response', response);
				return;
			}
			eventBus.emitEvent(`render:${toRender}`, data);
		}).catch(consoleError);
	};

	loadUserData = () => {
		jsonize(fetchGet('/api/profile/get')).then(response => {
			console.log("GET PROFILE ");
			if (response.status === 'ok') {
				this.authorized = true;
				const {userInfo} = response;
				// debugger;
				this.userInfo = new UserInfo(userInfo);
				storage.set('userInfo', this.userInfo);
				eventBus.emitEvent('application:authorized', this.userInfo);
			} else if (response.error.code === Errors.NotAuthorized.code) {
				this.authorized = false;
				storage.set('authState', false);
				eventBus.emitEvent('application:not-authorized');
			} else {
				consoleError('Unknown response', response);
			}
		}).catch(consoleError);
	}


}
