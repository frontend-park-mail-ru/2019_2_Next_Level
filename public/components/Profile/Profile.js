import {fetchGet, fetchPost} from '../../modules/fetch.js';
import {partial} from '../../modules/partial.js';

export class Profile {
	constructor(application) {
		console.log('Profile.constructor');
		this._application = application;
	}

	render = () => {
		console.log('Profile.render');
		fetchGet('/api/profile/get')
			.then(this._application._receive_response)
			.then(response => {
				console.log('Profile.render: fetch(/api/profile/get).then.then');

				const name = response['name'];
				this._application._element.innerHTML = window.fest['components/Profile/Profile.tmpl']({name});

				document.getElementById('signout-button').addEventListener('click', this._signout_button_listener);

				const change_name__form = document.getElementById('change-name__form');
				change_name__form.addEventListener('submit', partial(this._change_name__form_listener, change_name__form));
				const change_password__form = document.getElementById('change-password__form');
				change_password__form.addEventListener('submit', partial(this._change_password__form_listener, change_password__form));
			})
			.catch(this._application._catch_error);
	};

	_signout_button_listener = e => {
		console.log('Profile._signout_button_listener');
		e.preventDefault();

		fetchGet('/api/auth/signout')
			.then(this._application._receive_response)
			.then(this._application._dosignout)
			.catch(this._application._catch_error);
	};

	_change_name__form_listener = (form, e) => {
		console.log('Profile._change_name__form_listener', e);
		e.preventDefault();

		const name = form.elements['name'].value;
		if (this._application._check_name(name)) {
			fetchPost('/api/profile/edit', {name})
				.then(this._application._check_response)
				.catch(() => this._application._set_form__block__error_visibility('name', 'visible'));
		} else {
			this._application._set_form__block__error_visibility('name', 'visible');
		}
	};

	_change_password__form_listener = (form, e) => {
		console.log('Profile._change_password__form_listener', e);
		e.preventDefault();

		const password = form.elements['password'].value;
		const repeat_password = form.elements['repeat_password'].value;

		// flush first
		this._application._set_form__block__error_visibility('repeat_password', 'hidden');
		this._application._set_form__block__error_visibility('password', 'hidden');

		if (!this._application._check_password(password)) {
			this._application._set_form__block__error_visibility('password', 'visible');
			return;
		}
		if (password !== repeat_password) {
			this._application._set_form__block__error_visibility('repeat_password', 'visible');
			return;
		}

		fetchPost('/api/profile/edit', {password})
			.then(this._application._check_response)
			.catch(() => this._application._set_form__block__error_visibility('password', 'visible'));
	};
}
