import {partial} from '../../../modules/partial.js';
import {formMessage} from '../../Form/FormBlock/FormBlock.js';
import {checkPassword} from '../../../modules/validate.es6.inc.js';
import {consoleError, fetchPost, jsonizeResponse} from '../../../modules/fetch.js';
import {Errors} from '../../../modules/errors.es6.inc.js';

export default class Security {
	constructor(settings) {
		this.settings = settings;
	}

	render = renderMethod => {
		renderMethod(document.querySelector('.settings.box'), window.fest['components/Settings/Security/Security.tmpl']());

		// «Save!» button
		const form = document.querySelector('.settings.box .form');
		form.addEventListener('submit', partial(this.securityFormListener, form));

		// «Cancel» button
		document.querySelector('.settings.box button[name="cancel"]').addEventListener('click', partial(this.cancelButtonListener, renderMethod));
	};

	securityFormListener = (form, e) => {
		e.preventDefault();

		const currentPassword = form.elements['currentPassword'].value;
		const newPassword = form.elements['newPassword'].value;
		const newPasswordAgain = form.elements['newPasswordAgain'].value;

		formMessage('currentPassword', '');
		formMessage('newPassword', '');
		formMessage('newPasswordAgain', '');

		const checks = [
			{check: checkPassword, variable: currentPassword, name: 'currentPassword', msg: 'Wrong password'},
			{check: checkPassword, variable: newPassword, name: 'newPassword', msg: 'Wrong password'},
			{check: () => newPassword === newPasswordAgain, name: 'newPasswordAgain', msg: 'Passwords do not match'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				formMessage(c.name, c.msg);
				return;
			}
		}

		fetchPost('/api/settings/changePassword', {currentPassword, newPassword})
			.then(jsonizeResponse)
			.catch(consoleError)
			.then(this.securityFormListenerOnFulfilled)
			.catch(consoleError);
	};

	securityFormListenerOnFulfilled = response => {
		if (response.status === 'ok') {
			console.log('success');
			return;
		}

		switch (response.error.code) {
		case Errors.NotAuthorized:
			this.settings.signOut();
			break;
		case Errors.WrongPassword.code:
			formMessage('currentPassword', response.error.msg);
			break;
		case Errors.InvalidPassword.code:
			formMessage('newPassword', response.error.msg);
			break;
		case Errors.SamePasswords.code:
			formMessage('newPassword', response.error.msg);
			break;
		default:
			console.log('default:', response);
		}
	};

	cancelButtonListener = (renderMethod, e) => {
		e.preventDefault();
		this.render(renderMethod);
	};
}
