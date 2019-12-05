import {ApplicationRenderState} from './application-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {jsonize, fetchGet, consoleError} from '../../modules/fetch.js';
import {partial} from '../../modules/partial.js';
import router from '../../modules/router.js';
import routes from '../../modules/routes.js';

export default class ApplicationModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.authorized = undefined;

		this.renderState = ApplicationRenderState.NotRendered;

		routes.forEach(page => {
			eventBus.addEventListener(`prerender:${page}`, partial(this.prerender, page));
		});
	}

	/**
	 * Tries to GET /api/profile/get
	 */
	prerender = (toRender, data) => {
		if (this.authorized === !/auth/.test(toRender)) {
			eventBus.emitEvent(`render:${toRender}`, data);
			return;
		}
		jsonize(fetchGet('/api/profile/get')).then(response => {
			if (response.status === 'ok') {
				this.authorized = true;
				const {userInfo} = response;
				eventBus.emitEvent('application:authorized', userInfo);
				if (/auth/.test(toRender)) {
					return router.routeNew({}, '', '/messages/inbox');
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


}
