import ApplicationModel from './application-model.js';
import ApplicationView from './application-view.js';
import HeaderController from '../header/header-controller.js';
import MainController from '../main/main-controller.js';
import eventBus from '../../modules/event-bus.js';
import router from '../../modules/router.js';

export default class ApplicationController {
	/**
	 * @constructor
	 */
	constructor() {
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

		[
			'/auth/sign-in',
			'/auth/sign-up',
			'/settings/user-info',
			'/settings/security',
			'/messages/compose',
			'/messages/inbox',
			'/messages/sent',
		].forEach(path => {
			router.register(path, () => eventBus.emitEvent(`prerender:${path}`));
		});
	}

	/**
	 * Starts application
	 */
	start = () => {
		router.start();
	};
}

