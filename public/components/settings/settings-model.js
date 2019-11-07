import {SettingsRenderState} from './settings-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {jsonize, fetchPost, consoleError} from '../../modules/fetch.js';
import {checkLogin, checkPassword, checkDate, checkName} from '../../modules/validate.es6.inc.js';

export default class SettingsModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.dropRenderState();

		eventBus.addEventListener('application:authorized', this.onAuthorized);
		eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);

		eventBus.addEventListener('settings:user-info-save-button-clicked', this.onUserInfoSaveButtonClicked);
		eventBus.addEventListener('settings:security-save-button-clicked', this.onSecuritySaveButtonClicked);
	}

	dropRenderState = () => {
		this.renderState = SettingsRenderState.NotRendered;
	};

	onAuthorized = userInfo => {
		this.userInfo = userInfo;
	};

	onNotAuthorized = () => {
		this.userInfo = {};
	};

	onUserInfoSaveButtonClicked = userInfo => {
		//
	};

	// onUserInfoCancelButtonClicked = () => {
	// 	eventBus.emitEvent('render:settings-user-info');
	// };

	onSecuritySaveButtonClicked = ({currentPassword, newPassword, newPasswordAgain}) => {
		//
	};

	onSecurityCancelButtonClicked = () => {
		//
	};
}
