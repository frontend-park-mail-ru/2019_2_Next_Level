import {partial} from '../../modules/partial.js';
import {fetchPost} from '../../modules/fetch.js';
import {Errors} from '../../modules/errors.es6.inc.js';

export class SignIn {
	constructor(application) {
		console.log('SignIn.constructor');
		this._application = application;
	}

	render = () => {
		console.log('SignIn.render');
		this._application._element.innerHTML = window.fest['components/SignIn/SignIn.tmpl']();

		// «Join us!» button
		document.getElementById('signup-link').addEventListener('click', this._signup_link_listener);

		// «Sign in!» button
		const form = document.getElementById('signin-form');
		form.addEventListener('submit', partial(this._signin_form_listener, form));
	};

	_signup_link_listener = e => {
		console.log('SignIn._signup_link_listener');
		e.preventDefault();

		this._application._signup.render();
	};

	_signin_form_listener = (form, e) => {
		console.log('SignIn._signin_form_listener', form, e);
		e.preventDefault();

		const email = form.elements['email'].value;
		const password = form.elements['password'].value;

		fetchPost('/api/auth/signin', {email, password})
			.then(this._signin_form_listener_onFulfilled);
	};

	_signin_form_listener_onFulfilled = response => {
		console.log('SignIn._signin_form_listener_onFulfilled', response);

		if (response.ok) {
			this._application._dosignin();
			return;
		}
		response.json().then(json => {
			switch (json.error.code) {
			case Errors.WrongEmail.code:
				this._application._set_form__block__error_visibility('email', 'visible');
				this._application._set_form__block__error_visibility('password', 'hidden');
				break;
			case Errors.WrongPassword.code:
				this._application._set_form__block__error_visibility('email', 'hidden');
				this._application._set_form__block__error_visibility('password', 'visible');
				break;
			default:
				console.log('default:', json);
			}
		});
	};
}
