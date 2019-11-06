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

		eventBus.addEventListener('auth:authorized', () => router.routeNew({}, '', '/settings/user-info'));

		this.headerController = new HeaderController();
		this.mainController = new MainController();

		router.register('/', (pathname, search) => eventBus.emitEvent('prerender:auth-sing-in', {pathname, search}));
		router.register('/auth/sign-in', (pathname, search) => eventBus.emitEvent('prerender:auth-sing-in', {pathname, search}));
		router.register('/auth/sign-up', (pathname, search) => eventBus.emitEvent('prerender:auth-sing-up', {pathname, search}));
		router.register('/settings/user-info', (pathname, search) => eventBus.emitEvent('prerender:settings-user-info', {pathname, search}));
		router.register('/settings/security', (pathname, search) => eventBus.emitEvent('prerender:settings-security', {pathname, search}));
	}

	/**
	 * Starts application
	 */
	start = () => {
		router.start();
	};
}

