import {partial} from '../../../modules/partial.js';
import {fetchPost, jsonizeResponse, consoleError} from '../../../modules/fetch.js';
import {Errors} from '../../../modules/errors.es6.inc.js';
import {renderReplace} from '../../../modules/render.js';
import {checkName, checkDate, checkLogin, checkPassword} from '../../../modules/validate.es6.inc.js';
import {formMessage} from '../../Form/FormBlock/FormBlock.js';

export default class SignUp {
	constructor(auth) {
		this.auth = auth;
	}

	render = renderMethod => {
		renderMethod(document.querySelector('.auth.box'), window.fest['components/Auth/SignUp/SignUp.tmpl']());

		// «Sign in!» button
		document.querySelector('.auth.box .footer a').addEventListener('click', this.signInLinkListener);

		// «Sign in!» button
		const form = document.querySelector('.auth.box .form');
		form.addEventListener('submit', partial(this.signUpFormListener, form));
	};

	signInLinkListener = e => {
		e.preventDefault();

		this.auth.signIn.render(renderReplace);
	};

	signUpFormListener = (form, e) => {
		e.preventDefault();

		const firstName = form.elements['firstName'].value;
		const secondName = form.elements['secondName'].value;
		const birthDate = form.elements['birthDate'].value;
		const sex = form.elements['sex'].value;
		const login = form.elements['login'].value;
		const password = form.elements['password'].value;

		formMessage('firstName', '');
		formMessage('secondName', '');
		formMessage('birthDate', '');
		formMessage('login', '');
		formMessage('password', '');

		const checks = [
			{check: checkName, variable: firstName, name: 'firstName', msg: 'Wrong name!'},
			{check: checkName, variable: secondName, name: 'secondName', msg: 'Wrong name!'},
			{check: checkDate, variable: birthDate, name: 'birthDate', msg: 'Wrong date!'},
			{check: checkLogin, variable: login, name: 'login', msg: 'Wrong login!'},
			{check: checkPassword, variable: password, name: 'password', msg: 'Wrong password!'},
		];

		for (let c of checks) {
			console.log(c);
			if (!c.check(c.variable)) {
				formMessage(c.name, c.msg);
				return;
			}
		}

		fetchPost('/api/auth/signUp', {firstName, secondName, birthDate, sex, login, password})
			.then(jsonizeResponse)
			.catch(consoleError)
			.then(this.signUpFormListenerOnFulfilled)
			.catch(consoleError);
	};

	signUpFormListenerOnFulfilled = response => {
		if (response.status === 'ok') {
			this.auth.authorize();
			return;
		}

		switch (response.error.code) {
		case Errors.InvalidLogin.code:
		case Errors.UserExists.code:
			formMessage('login', response.error.msg);
			break;
		case Errors.InvalidPassword.code:
			formMessage('password', response.error.msg);
			break;
		case Errors.InvalidFirstName.code:
			formMessage('firstName', response.error.msg);
			break;
		case Errors.InvalidSecondName.code:
			formMessage('secondName', response.error.msg);
			break;
		case Errors.InvalidBirthDate.code:
			formMessage('birthDate', response.error.msg);
			break;
		default:
			console.log('default:', response);
		}
	};
}
