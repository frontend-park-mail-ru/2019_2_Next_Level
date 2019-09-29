import {partial} from '../../modules/partial.js';
import {fetchPost} from '../../modules/fetch.js';
import {Errors} from '../../modules/errors.es6.inc.js';

export class SignUp {
	constructor(application) {
		this._application = application;
	}

	render = () => {
		this._application._element.innerHTML = window.fest['components/SignUp/SignUp.tmpl']();

		// «Sign in!» button
		document.getElementById('signin-link').addEventListener('click', this._signin_link_listener);

		// «Join!» button
		const form = document.getElementById('signup-form');
		form.addEventListener('submit', partial(this._signup_form_listener, form));
	};

	_signin_link_listener = e => {
		console.log('SignUp._signin_link_listener');
		e.preventDefault();

		this._application._signin.render();
	};

	_signup_form_listener = (form, e) => {
		console.log('SignUp._signup_form_listener', form, e);
		e.preventDefault();

		const name = form.elements['name'].value;
		const email = form.elements['email'].value;
		const password = form.elements['password'].value;

		fetchPost('/api/auth/signup', {name, email, password})
			.then(this._signup_form_listener_onFulfilled);
	};

	_signup_form_listener_onFulfilled = response => {
		console.log('SignIn._signup_form_listener_onFulfilled', response);

		if (response.ok) {
			this._application._dosignin();
			return;
		}
		response.json().then(json => {
			this._application._set_form__block__error_visibility('name', 'hidden');
			this._application._set_form__block__error_visibility('email', 'hidden');
			this._application._set_form__block__error_visibility('password', 'hidden');

			switch (json.error.code) {
			case Errors.InvalidName.code:
				this._application._set_form__block__error_visibility('name', 'visible');
				break;
			case Errors.InvalidEmail.code:
				this._application._set_form__block__error_visibility('email', 'visible');
				break;
			case Errors.InvalidPassword.code:
				this._application._set_form__block__error_visibility('password', 'visible');
				break;
			default:
				console.log('default:', json);
			}
		});
	};
}
