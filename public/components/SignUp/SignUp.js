import {partial} from '../../modules/partial.js';
import {fetchPost} from '../../modules/fetch.js';

export class SignUp {
	constructor(application) {
		this._application = application;
	}

	render() {
		this._application._element.innerHTML = window.fest['components/SignUp/SignUp.tmpl']();

		// «Sign in!» button
		document.getElementById('signin-link').addEventListener('click', this._signin_link_listener);

		// «Join!» button
		const form = document.getElementById('signup-form');
		form.addEventListener('submit', partial(this._signup_form_listener, form));
	}

	_signin_link_listener = (e) => {
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
			.then(this._application._check_response)
			.then(this._application._dosignin)
			.catch(this._application._catch_error);
	};
}
