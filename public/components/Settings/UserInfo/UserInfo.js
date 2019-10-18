import {fetchPost, jsonizeResponse, consoleError} from '../../../modules/fetch.js';
import {partial} from '../../../modules/partial.js';
import {formMessage} from '../../Form/FormBlock/FormBlock.js';
import {checkDate, checkName, checkNickName, checkSex} from '../../../modules/validate.es6.inc.js';
import {Errors} from '../../../modules/errors.es6.inc.js';

export default class UserInfo {
	constructor(settings) {
		this.settings = settings;
	}

	render = (renderMethod, userData) => {
		renderMethod(document.querySelector('.settings.box'), window.fest['components/Settings/UserInfo/UserInfo.tmpl'](userData));
		document.querySelector(`input[value="${userData.sex}"]`).checked = true;

		// «Save!» button
		const form = document.querySelector('.settings.box .form');
		form.addEventListener('submit', partial(this.userInfoFormListener, form));

		// «Cancel» button
		document.querySelector('.settings.box button[name="cancel"]').addEventListener('click', partial(this.cancelButtonListener, renderMethod, userData));
	};

	userInfoFormListener = (form, e) => {
		e.preventDefault();

		const firstName = form.elements['firstName'].value;
		const secondName = form.elements['secondName'].value;
		const nickName = form.elements['nickName'].value;
		const birthDate = form.elements['birthDate'].value;
		const sex = form.elements['sex'].value;

		formMessage('firstName', '');
		formMessage('secondName', '');
		formMessage('nickName', '');
		formMessage('birthDate', '');

		const checks = [
			{check: checkName, variable: firstName, name: 'firstName', msg: 'Wrong name!'},
			{check: checkName, variable: secondName, name: 'secondName', msg: 'Wrong name!'},
			{check: checkNickName, variable: nickName, name: 'nickName', msg: 'Wrong nick name!'},
			{check: checkDate, variable: birthDate, name: 'birthDate', msg: 'Wrong date!'},
			{check: checkSex, variable: sex, name: 'sex', msg: 'Wrong sex!'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				formMessage(c.name, c.msg);
				return;
			}
		}

		fetchPost('/api/settings/changeUserInfo', {firstName, secondName, nickName, birthDate, sex})
			.then(jsonizeResponse)
			.catch(consoleError)
			.then(this.userInfoFormListenerOnFulfilled)
			.catch(consoleError);
	};

	userInfoFormListenerOnFulfilled = response => {
		if (response.status === 'ok') {
			console.log('success');
			this.settings.application.renderSettings();
			return;
		}

		switch (response.error.code) {
		case Errors.NotAuthorized:
			this.settings.signOut();
			break;
		case Errors.InvalidFirstName.code:
			formMessage('firstName', response.error.msg);
			break;
		case Errors.InvalidSecondName.code:
			formMessage('secondName', response.error.msg);
			break;
		case Errors.InvalidNickName.code:
			formMessage('nickName', response.error.msg);
			break;
		case Errors.InvalidBirthDate.code:
			formMessage('birthDate', response.error.msg);
			break;
		default:
			console.log('default:', response);
		}
	};

	cancelButtonListener = (renderMethod, userData, e) => {
		e.preventDefault();
		this.render(renderMethod, userData);
	};
}
