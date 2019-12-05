import ApplicationModel from './application-model.js';
import ApplicationView from './application-view.js';
import HeaderController from '../header/header-controller.js';
import MainController from '../main/main-controller.js';
import eventBus from '../../modules/event-bus.js';
import router from '../../modules/router.js';
import routes from '../../modules/routes.js';

import {SettingsPages} from '../settings/routes.js';
import {AuthPages} from '../auth/routes.js';
import {MessagesPages} from '../messages/routes.js';

export default class ApplicationController {
	/**
	 * @constructor
	 */
	constructor() {
		routes.AddRoutes(new Map([['settings', SettingsPages],
										 ['auth', AuthPages],
										 ['messages', MessagesPages]]));

		this.applicationModel = new ApplicationModel();
		this.applicationView = new ApplicationView(this.applicationModel);

		eventBus.addEventListener('application:sign-out', () => router.routeNew({}, '', '/auth/sigh-in')); // popup ?
		eventBus.addEventListener('auth:authorized', () => router.routeNew({}, '', '/messages/inbox'));

		// // Проверим, что эта технология доступна в браузере
		// if ('serviceWorker' in navigator) {
		// 	navigator.serviceWorker.register('./dist/sw.js')
		// 		.then(res => console.log('Registration succeeded. Scope is ' + res.scope))
		// 		.catch(error => console.log('Registration failed with ' + error));
		// }

		this.headerController = new HeaderController();
		this.mainController = new MainController();

		router.register('/', () => router.routeNew({}, '', '/auth/sign-in'));

		routes.forEach(path => {
			router.register(path, (pathname, search) => eventBus.emitEvent(`prerender:${path}`, {pathname, search}));
		});
	}

	/**
	 * Starts application
	 */
	start = () => {
		router.start();
	};
}

