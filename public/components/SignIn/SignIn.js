import {partial} from '../../modules/partial.js';
import {fetchPost} from '../../modules/fetch.js';

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

	_signup_link_listener = (e) => {
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
			.then(this._application._check_response)
			.then(this._application._dosignin)
			.catch(this._application._catch_error);
	};
}
