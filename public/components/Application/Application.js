import {Profile} from '../Profile/Profile.js';
import {SignIn} from '../SignIn/SignIn.js';
import {SignUp} from '../SignUp/SignUp.js';
import {fetchGet} from '../../modules/fetch.js';

const ApplicationState = {
	NOT_AUTHORIZED: 0,
	AUTHORIZED: 1,
};

export class Application {
	constructor(element=document.body) {
		console.log('Application.constructor');
		this._element = element;
		this._profile = new Profile(this);
		this._signin = new SignIn(this);
		this._signup = new SignUp(this);

		fetchGet('/api/profile/get')
			.then(this._check_response)
			.then(this._dosignin)
			.catch(this._dosignout);
	}

	render = () => {
		console.log('Application.render');
		switch (this._state) {
		case ApplicationState.NOT_AUTHORIZED:
			this._signin.render();
			break;
		case ApplicationState.AUTHORIZED:
			this._profile.render();
			break;
		}
	};

	get _session_id() {
		console.log('Application._session_id');
		return document.cookie['user-token'];
	}

	_dosignin = () => {
		console.log('Application._dosignin');
		this._state = ApplicationState.AUTHORIZED;
		this._profile.render();
	};

	_dosignout = () => {
		console.log('Application._dosignout');
		this._state = ApplicationState.NOT_AUTHORIZED;
		this._signin.render();
	};

	_receive_response = (response) => {
		console.log('Application._receive_response', response);
		if (!response.ok) {
			throw new Error(`Неверный статус ${response.status}`);
		}
		return response.json();
	};

	// IF response(200).end() [WITHOUT .json()] THEN USE THIS
	_check_response = (response) => {
		console.log('Application._check_response', response);
		if (!response.ok) {
			throw new Error(`Неверный статус ${response.status}`);
		}
		return response;
	};

	_catch_error = (err) => {
		console.log('Application._catch_error', err);
		console.error(err);
	};

	_get_form__block__error = name => document.querySelector(`.form__block__input[name=${name}]~.form__block__error`);
	_set_form__block__error_visibility = (name, visibility) => this._get_form__block__error(name).style.visibility = visibility;

}
