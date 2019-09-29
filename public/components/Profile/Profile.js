import {fetchGet} from '../../modules/fetch.js';

export class Profile {
	constructor(application) {
		console.log('Profile.constructor');
		this._application = application;
	}

	render = () => {
		console.log('Profile.render');
		fetchGet('http://localhost:3000/api/profile/get')
			.then(this._application._receive_response)
			.then(response => {
				console.log('Profile.render: fetch(/api/profile/get).then.then');
				const name = response['name'];
				this._application._element.innerHTML = window.fest['components/Profile/Profile.tmpl']({name});

				document.getElementById('signout-button').addEventListener('click', this._signout_button_listener);
			})
			.catch(this._application._catch_error);
	};

	_signout_button_listener = (e) => {
		console.log('Profile._signout_button_listener');
		e.preventDefault();


		fetchGet('http://localhost:3000/api/auth/signout')
			.then(this._application._receive_response)
			.then(this._application._dosignout)
			.catch(this._application._catch_error);
	};
}
