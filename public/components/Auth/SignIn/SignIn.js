import {partial} from '../../../modules/partial.js';
import {fetchPost, consoleError, jsonizeResponse} from '../../../modules/fetch.js';
import {renderReplace} from '../../../modules/render.js';
import {Errors} from '../../../modules/errors.es6.inc.js';
import {checkLogin, checkPassword} from '../../../modules/validate.es6.inc.js';
import {formMessage} from '../../Form/FormBlock/FormBlock.js';

export default class SignIn {
	constructor(auth) {
		this.auth = auth;
	}

	render = renderMethod => {
		renderMethod(document.querySelector('.auth.box'), window.fest['components/Auth/SignIn/SignIn.tmpl']());

		// «Join us!» button
		document.querySelector('.auth.box .footer a').addEventListener('click', this.signUpLinkListener);

		// «Sign in!» button
		const form = document.querySelector('.auth.box .form');
		form.addEventListener('submit', partial(this.signInFormListener, form));
	};

	signUpLinkListener = e => {
		e.preventDefault();

		this.auth.signUp.render(renderReplace);
	};

	signInFormListener = (form, e) => {
		e.preventDefault();

		const login = form.elements['login'].value;
		const password = form.elements['password'].value;

		formMessage('login', '');
		formMessage('password', '');

		if (!checkLogin(login)) {
			formMessage('login', 'Wrong login!');
			return;
		}

		if (!checkPassword(password)) {
			formMessage('password', 'Wrong password!');
			return;
		}

		fetchPost('/api/auth/signIn', {login, password})
			.then(jsonizeResponse)
			.catch(consoleError)
			.then(this.signInFormListenerOnFulfilled);
	};

	signInFormListenerOnFulfilled = response => {
		if (response.status === 'ok') {
			this.auth.authorize();
			return;
		}

		switch (response.error.code) {
		case Errors.WrongLogin.code:
			formMessage('login', response.error.msg);
			break;
		case Errors.WrongPassword.code:
			formMessage('password', response.error.msg);
			break;
		default:
			console.log('default:', response);
		}
	};
}
