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
	}

	/**
	 * @callback RouterCallback
	 * @param {DOMString} pathname
	 * @param {Object} search
	 */

	/**
	 * Registers route
	 * @param   {DOMString} path
	 * @param   {RouterCallback} callback
	 * @returns {Router}
	 */
	register = (path, callback) => {
		if (this.routes.has(path)) {
			console.error('Path already registered');
			return this;
		}

		this.routes.set(path, callback);
		return this;
	};

	/**
	 * Starts routing
	 * @returns {Router}
	 */
	start = () => {
		window.addEventListener('popstate', () => {
			this.routeCurrent();
		});

		this.root.addEventListener('click', event => {
			const link = event.target.closest('[href]');
			if (link === null) {
				return;
			}

			event.preventDefault();

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
	 * @param   {DOMString} title
	 * @param   {DOMString} url
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
		return this.route(window.location.pathname, window.location.search);
	};

	/**
	 * Routes path
	 * @param   {DOMString} pathname
	 * @param   {DOMString} search
	 * @returns {Router}
	 */
	route = (pathname, search) => {
		console.log('route', pathname, search);
		if (!this.routes.has(pathname)) {
			console.error(`Unknown pathname: ${pathname}`);
			return this;
		}

		this.routes.get(pathname)(pathname, parseSearch(search));
		return this;
	};
}

export default new Router();
