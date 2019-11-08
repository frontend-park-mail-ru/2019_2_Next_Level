import {SettingsRenderState} from './settings-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {jsonize, fetchPost, consoleError} from '../../modules/fetch.js';
import {checkName, checkNickName, checkDate, checkSex, checkPassword} from '../../modules/validate.es6.inc.js';

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

	onUserInfoSaveButtonClicked = ({firstName, secondName, nickName, birthDate, sex}) => {
		const checks = [
			{check: checkName, variable: firstName, name: 'firstName', msg: 'Wrong first name!'},
			{check: checkName, variable: secondName, name: 'secondName', msg: 'Wrong second name!'},
			{check: checkNickName, variable: nickName, name: 'nickName', msg: 'Wrong nick name!'},
			{check: checkDate, variable: birthDate, name: 'birthDate', msg: 'Wrong birth date!'},
			{check: checkSex, variable: sex, name: 'sex', msg: 'Wrong sex!'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				eventBus.emitEvent('settings:user-info-validate', {inputName: c.name, message: c.msg});
				return;
			}
		}

		const userInfo = {firstName, secondName, nickName, avatar: null, birthDate, sex};

		jsonize(fetchPost('/api/profile/editUserInfo', {userInfo})).then(response => {
			if (response.status === 'ok') {
				eventBus.emitEvent('settings:user-info-validate', {inputName: 'sex', message: ''});
				eventBus.emitEvent('settings:edit-user-info');
				return;
			}

			let inputName = '';
			switch (response.error.code) {
			case Errors.NotAuthorized:
				eventBus.emitEvent('application:sign-out');
				break;
			case Errors.InvalidFirstName.code:
				inputName = 'firstName';
				break;
			case Errors.InvalidSecondName.code:
				inputName = 'secondName';
				break;
			case Errors.InvalidNickName.code:
				inputName = 'nickName';
				break;
			case Errors.InvalidBirthDate.code:
				inputName = 'birthDate';
				break;
			case Errors.InvalidSex.code:
				inputName = 'sex';
				break;
			default:
				console.error('Unknown response:', response);
				return;
			}
			eventBus.emitEvent('settings:user-info-validate', {inputName, message: response.error.msg});
		}).catch(consoleError);
	};

	onSecuritySaveButtonClicked = ({currentPassword, newPassword, newPasswordAgain}) => {
		const checks = [
			{check: checkPassword, variable: currentPassword, name: 'currentPassword', msg: 'Wrong password'},
			{check: checkPassword, variable: newPassword, name: 'newPassword', msg: 'Wrong password'},
			{check: () => newPassword === newPasswordAgain, name: 'newPasswordAgain', msg: 'Passwords do not match'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				eventBus.emitEvent('settings:security-validate', {inputName: c.name, message: c.msg});
				return;
			}
		}

		jsonize(fetchPost('/api/profile/editPassword', {currentPassword, newPassword})).then(response => {
			if (response.status === 'ok') {
				eventBus.emitEvent('settings:security-validate', {inputName: 'newPassword', message: ''});
				eventBus.emitEvent('settings:edit-password');
				return;
			}

			let inputName = '';
			switch (response.error.code) {
			case Errors.NotAuthorized:
				eventBus.emitEvent('application:sign-out');
				break;
			case Errors.WrongPassword.code:
				inputName = 'currentPassword';
				break;
			case Errors.InvalidPassword.code:
				inputName = 'newPassword';
				break;
			case Errors.SamePasswords.code:
				inputName = 'newPassword';
				break;
			default:
				console.error('Unknown response:', response);
				return;
			}
			eventBus.emitEvent('settings:security-validate', {inputName, message: response.error.msg});
		}).catch(consoleError);
	};
}
