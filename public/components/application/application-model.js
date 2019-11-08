import {ApplicationRenderState} from './application-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {jsonize, fetchGet, consoleError} from '../../modules/fetch.js';
import {partial} from '../../modules/partial.js';

export default class ApplicationModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.authorized = undefined;

		this.renderState = ApplicationRenderState.NotRendered;

		[
			'/auth/sign-in',
			'/auth/sign-up',
			'/settings/user-info',
			'/settings/security',
			'/messages/compose',
			'/messages/inbox',
			'/messages/sent',
		].forEach(page => {
			eventBus.addEventListener(`prerender:${page}`, partial(this.prerender, page));
		});
	}

	/**
	 * Tries to GET /api/profile/get
	 */
	prerender = toRender => {
		if (this.authorized === !/auth/.test(toRender)) {
			eventBus.emitEvent(`render:${toRender}`);
			return;
		}
		jsonize(fetchGet('/api/profile/get')).then(response => {
			if (response.status === 'ok') {
				this.authorized = true;
				const {userInfo} = response;
				eventBus.emitEvent('application:authorized', userInfo);
				if (/auth/.test(toRender)) {
					toRender = '/settings/user-info';
					window.history.pushState({}, '', '/settings/user-info');
				}
			} else if (response.error.code === Errors.NotAuthorized.code) {
				this.authorized = false;
				eventBus.emitEvent('application:not-authorized');
				if (!/auth/.test(toRender)) {
					toRender = '/auth/sign-in';
					window.history.pushState({}, '', '/auth/sign-in');
				}
			} else {
				consoleError('Unknown response', response);
				return;
			}
			eventBus.emitEvent(`render:${toRender}`);
		}).catch(consoleError);
	};


}
