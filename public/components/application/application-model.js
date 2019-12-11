import {ApplicationRenderState} from './application-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {jsonize, fetchGet, consoleError} from '../../modules/fetch.js';
import {partial} from '../../modules/partial.js';
import router from '../../modules/router.js';
import routes from '../../modules/routes.js';
import storage from '../../modules/storage';
import {UserInfo} from '../../modules/userInfo';

export default class ApplicationModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.authorized = undefined;
		this.userInfo = new UserInfo();
		storage.addData('userInfo', this.userInfo);
		storage.addData('currentPage', '/messages/inbox');

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
			storage.addData('userInfo', new UserInfo());
		});
		eventBus.addEventListener('auth:authorized', () => this.loadUserData(), 10);
	};

	/**
	 * Tries to GET /api/profile/get
	 */
	prerender = (toRender, data) => {
		if (this.authorized === !/auth/.test(toRender)) {
			console.log('AUTHORIZED');
			storage.addData('currentPage', toRender);
			eventBus.emitEvent(`render:${toRender}`, data);
			return;
		}

		// авторизован и пошел на /auth/...
		// неавторизован и идешь в приватную часть
		jsonize(fetchGet('/api/profile/get')).then(response => {
			console.log("GET PROFILE ", toRender);
			if (response.status === 'ok') {

				this.authorized = true;
				const {userInfo} = response;
				// debugger;
				this.userInfo = new UserInfo(userInfo);
				storage.addData('userInfo', this.userInfo);
				eventBus.emitEvent('application:authorized', this.userInfo);
				if (/auth/.test(toRender)) {
					let path = storage.get('currentPage');
					if (/auth/.test(path)) {
						path = '/messages/inbox';
						storage.addData('currentPage', path);
					}
					return router.routeNew({}, '', path);
					// return router.routeNew({}, '', storage.get('currentPage'));
				}
			} else if (response.error.code === Errors.NotAuthorized.code) {
				this.authorized = false;
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
				storage.addData('userInfo', this.userInfo);
				eventBus.emitEvent('application:authorized', this.userInfo);
			}
		}).catch(consoleError);
	}


}
