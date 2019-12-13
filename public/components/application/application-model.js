import {ApplicationRenderState} from './application-utility.js';
import {Errors} from 'public/modules/errors.es6.inc.js';
import eventBus from 'public/modules/event-bus.js';
import {jsonize, fetchGet, consoleError} from 'public/modules/fetch.js';
import {partial} from 'public/modules/partial.js';
import router from 'public/modules/router.js';
import routes from 'public/modules/routes.js';
import storage from 'public/modules/storage';
import {UserInfo} from 'public/modules/userInfo';

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
