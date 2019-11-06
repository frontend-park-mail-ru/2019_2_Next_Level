import {ApplicationRenderState} from './application-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {jsonize, fetchGet, consoleError} from '../../modules/fetch.js';

export default class ApplicationModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.authorized = undefined;
		this.renderState = ApplicationRenderState.NotRendered;
		this.toRender = undefined;

		eventBus.addEventListener('prerender:auth-sing-in', this.prerenderAuthSignIn);
		eventBus.addEventListener('prerender:auth-sing-up', this.prerenderAuthSignUp);
		eventBus.addEventListener('prerender:settings-user-info', this.prerenderSettingsUserInfo);
		eventBus.addEventListener('prerender:settings-security', this.prerenderSettingsSecurity);
	}

	prerenderAuthSignIn = ({pathname, search}) => {
		this.toRender = 'auth-sign-in';
		this.profileGet();
	};

	prerenderAuthSignUp = ({pathname, search}) => {
		this.toRender = 'auth-sign-up';
		this.profileGet();
	};

	prerenderSettingsUserInfo = ({pathname, search}) => {
		this.toRender = 'settings-user-info';
		this.profileGet();
	};

	prerenderSettingsSecurity = ({pathname, search}) => {
		this.toRender = 'settings-security';
		this.profileGet();
	};

	/**
	 * Tries to GET /api/profile/get
	 * @returns {Promise<Object>}
	 */
	profileGet = () => {
		return jsonize(fetchGet('/api/profile/get'))
			.then(response => {
				if (response.status === 'ok') {
					this.authorized = true;
					const {firstName, secondName, nickName, avatar, birthDate, sex} = response;
					eventBus.emitEvent('application:authorized', {firstName, secondName, nickName, avatar, birthDate, sex});
					if (/auth/.test(this.toRender)) {
						this.toRender = 'settings-user-info';
					}
				} else if (response.error.code === Errors.NotAuthorized.code) {
					this.authorized = false;
					eventBus.emitEvent('application:not-authorized');
					if (!/auth/.test(this.toRender)) {
						this.toRender = 'auth-sign-in';
					}
				} else {
					consoleError('Unknown response', response);
				}
				eventBus.emitEvent(`render:${this.toRender}`);
				this.toRender = undefined;
			})
			.catch(consoleError);
	};
}
