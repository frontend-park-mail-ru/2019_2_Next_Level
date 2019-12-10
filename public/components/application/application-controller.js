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
		// Global data are stored in AppModel
		// which is created just once a session.
		this.applicationModel = new ApplicationModel();
		this.init();
	}

	// Creates and recreates whole the application except Model
	init = () => {
		console.log('REINIT');
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
		});
		this.headerController = new HeaderController();
		this.mainController = new MainController();
		router.routeCurrent();
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

