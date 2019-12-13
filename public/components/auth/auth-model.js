import {AuthRenderState} from './auth-utility.js';
import {Errors} from 'errors.es6.inc.js';
import eventBus from 'event-bus.js';
import {jsonize, fetchPost, consoleError} from 'fetch.js';
import {checkLogin, checkPassword, checkDate, checkName} from 'validate.es6.inc.js';

export default class AuthModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.dropRenderState();

		eventBus.addEventListener('auth:sign-in-button-clicked', this.onSignInButtonClicked);
		eventBus.addEventListener('auth:sign-up-button-clicked', this.onSignUpButtonClicked);
	}

	dropRenderState = () => {
		this.renderState = AuthRenderState.NotRendered;
	};

	onSignInButtonClicked = ({login, password}) => {
		const checks = [
			{check: checkLogin, variable: login, name: 'login', msg: 'Wrong login!'},
			{check: checkPassword, variable: password, name: 'password', msg: 'Wrong password!'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				eventBus.emitEvent('auth:sign-in-validate', {inputName: c.name, message: c.msg});
				return;
			}
		}

		jsonize(fetchPost('/api/auth/signIn', {login, password})).then(response => {
			if (response.status === 'ok') {
				eventBus.emitEvent('auth:authorized');
				return;
			}

			let inputName = '';
			switch (response.error.code) {
			case Errors.WrongLogin.code:
				inputName = 'login';
				break;
			case Errors.WrongPassword.code:
				inputName = 'password';
				break;
			default:
				console.error('Unknown response:', response);
				return;
			}
			eventBus.emitEvent('auth:sign-in-validate', {inputName, message: response.error.msg});
		}).catch(consoleError);
	};

	onSignUpButtonClicked = ({firstName, secondName, birthDate, sex, login, password}) => {
		const checks = [
			{check: checkName, variable: firstName, name: 'firstName', msg: 'Wrong name!'},
			{check: checkName, variable: secondName, name: 'secondName', msg: 'Wrong name!'},
			{check: checkDate, variable: birthDate, name: 'birthDate', msg: 'Wrong date!'},
			{check: checkLogin, variable: login, name: 'login', msg: 'Wrong login!'},
			{check: checkPassword, variable: password, name: 'password', msg: 'Wrong password!'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				eventBus.emitEvent('auth:sign-up-validate', {inputName: c.name, message: c.msg});
				return;
			}
		}

		jsonize(fetchPost('/api/auth/signUp', {firstName, secondName, birthDate, sex, login, password})).then(response => {
			if (response.status === 'ok') {
				eventBus.emitEvent('auth:authorized');
				return;
			}

			let inputName = '';
			switch (response.error.code) {
			case Errors.InvalidLogin.code:
			case Errors.UserExists.code:
				inputName = 'login';
				break;
			case Errors.InvalidPassword.code:
				inputName = 'password';
				break;
			case Errors.InvalidFirstName.code:
				inputName = 'firstName';
				break;
			case Errors.InvalidSecondName.code:
				inputName = 'secondName';
				break;
			case Errors.InvalidBirthDate.code:
				inputName = 'birthDate';
				break;
			default:
				console.error('Unknown response:', response);
				return;
			}
			eventBus.emitEvent('auth:sign-up-validate', {inputName, message: response.error.msg});
		}).catch(consoleError);
	};
}
