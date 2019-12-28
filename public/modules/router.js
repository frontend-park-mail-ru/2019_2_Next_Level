import {parseSearch} from './router-utility.js';

class Router {
	/**
	 * @constructor
	 * @param {HTMLElement} root
	 */
	constructor(root=document.querySelector('body')) {
		this.root = root;
		this.routes = new Map();
		this.currentPath = null;
		this.defaultPath = '/auth/sign-in';
	}

	/**
	 * @callback RouterCallback
	 * @param {string} pathname
	 * @param {Object} search
	 */

	/**
	 * Registers route
	 * @param   {string} path
	 * @param   {RouterCallback} callback
	 * @returns {Router}
	 */
	register = (path, callback) => {
		if (this.routes.has(path)) {
			// console.error('Path already registered');
			return this;
		}
		this.routes.set(path, callback);
		// console.log(`Register: ${path}`)
		return this;
	};

	setDefault = (path) => {
		this.defaultPath = path;
	}

	/**
	 * Starts routing
	 * @returns {Router}
	 */
	start = () => {
		window.addEventListener('popstate', () => {
			// console.log('popstate');
			this.routeCurrent();
		});

		this.root.addEventListener('click', event => {
			const link = event.target.closest('[href]');
			if (link === null) {
				return;
			}

			event.preventDefault();
			// window.history.pushState({}, link.href.split('/').pop(), link.href);
			window.history.pushState({}, '', link.href);
			return this.routeCurrent();
		});

		return this.routeCurrent();
	};

	/**
	 * Goes for delta routes
	 * @param   {int} delta
	 * @returns {Router}
	 */
	go = delta => {
		window.history.go(delta);
		return this.routeCurrent();
	};

	/**
	 * Goes for 1 route backward
	 * @returns {Router}
	 */
	back = () => {
		return this.go(1);
	};

	/**
	 * Goes for 1 route forward
	 * @returns {Router}
	 */
	forward = () => {
		return this.go(-1);
	};

	/**
	 * Opens new url
	 * @param   {*} data
	 * @param   {string} title
	 * @param   {string} url
	 * @returns {Router}
	 */
	routeNew = (data, title, url) => {
		window.history.pushState(data, title, url);
		return this.routeCurrent();
	};

	/**
	 * Routes current path
	 * @returns {Router}
	 */
	routeCurrent = () => {
		// console.log('RouteCurrent: ', window.location.pathname);
		return this.route(window.location.pathname, window.location.search);
	};

	/**
	 * Routes path
	 * @param   {string} pathname
	 * @param   {string} search
	 * @returns {Router}
	 */
	route = (pathname, search) => {
		// debugger;
		// console.log('route', pathname, search);
		// if (!this.routes.has(pathname)) {
		// 	// console.log(`Unknown pathname: ${pathname}`);
		// 	this.routeNew({}, '', this.defaultPath);
		// 	return this;
		// }
		let callback = this.routes.get(pathname);
		if (!callback) {
			callback = this.resolveByRegexp(pathname);
			if (!callback) {
				// console.log(`Unknown pathname: ${pathname}`);
				this.routeNew({}, '', this.defaultPath);
				return this;
			}
		}
		// console.log('route(): ', pathname);
		callback(pathname, parseSearch(search));
		return this;
	};

	clearRoutes = () => {
		this.routes.clear();
		// console.log('Router: clear');
	}

	getCurrentPage = () => {
		return window.location.pathname;
	}

	resolveByRegexp(path) {
		for (let pair of this.routes) {
			if (typeof pair[0] === 'object' && pair[0].test(path)) {
				return pair[1];
			}
		}
		return null;
	}
}

export default new Router();
