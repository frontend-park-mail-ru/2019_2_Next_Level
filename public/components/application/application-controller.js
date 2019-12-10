import ApplicationModel from './application-model.js';
import ApplicationView from './application-view.js';
import HeaderController from '../header/header-controller.js';
import MainController from '../main/main-controller.js';
import eventBus from '../../modules/event-bus.js';
import router from '../../modules/router.js';
import routes from '../../modules/routes.js';
import storage from '../../modules/storage';

import {SettingsPages} from '../settings/routes.js';
import {AuthPages} from '../auth/routes.js';
import {MessagesPages} from '../messages/routes.js';

export default class ApplicationController {
	/**
	 * @constructor
	 */
	constructor() {
		// Global data are stored in AppModel
		// which is created just once a session.
		this.applicationModel = new ApplicationModel();
		let currentPage = router.getCurrentPage();
		if (currentPage==='/') {
			currentPage = '/messages/inbox';
		}
		storage.addData('currentPage', currentPage);
		console.log("Start: ", storage.get('currentPage'));
		this.init();
	}

	// Creates and recreates whole the application except Model
	init = () => {
		// debugger;
		console.log('REINIT');
		const currentPage = router.getCurrentPage();
		console.log("Remembered page: ", storage.get('currentPage'));
		eventBus.Clear();
		this.reloadRouter();
		this.applicationModel.init();
		this.applicationView = new ApplicationView(this.applicationModel);

		eventBus.addEventListener('application:sign-out', () => router.routeNew({}, '', '/auth/sigh-in')); // popup ?
		eventBus.addEventListener('auth:authorized', () => router.routeNew({}, '', '/messages/inbox'));

		eventBus.addEventListener('router:reload', () => {
			// debugger;
			// router.clearRoutes();
			// router.register('/', () => router.routeNew({}, '', '/auth/sign-in'));
			//
			// routes.forEach(path => {
			// 	router.register(path, (pathname, search) => eventBus.emitEvent(`prerender:${path}`, {pathname, search}));
			// });

			// this.reloadRouter();
			this.init();
			eventBus.emitEvent('render:update');
		});
		this.headerController = new HeaderController();
		this.mainController = new MainController();
		// debugger;

		eventBus.addEventListener('render:update', () => router.routeNew({}, '', storage.get('currentPage')));
		// eventBus.addEventListener('render:update', () => router.routeNew({}, '', currentPage));
		// eventBus.addEventListener('render:update', router.routeCurrent);
	};

	reloadRouter = () => {
		router.clearRoutes();
		routes.AddRoutes(new Map([['settings', SettingsPages],
			['auth', AuthPages],
			['messages', MessagesPages]]));

		router.register('/', () => router.routeNew({}, '', '/auth/sign-in'));
		routes.forEach(path => {
			router.register(path, (pathname, search) => eventBus.emitEvent(`prerender:${path}`, {pathname, search}));
		});
	};

	/**
	 * Starts application
	 */
	start = () => {
		router.start();
	};
}

