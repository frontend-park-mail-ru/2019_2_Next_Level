import Header from '../Header/Header.js';
import Main from '../Main/Main.js';
import Nav from '../Nav/Nav.js';
import Auth from '../Auth/Auth.js';
import Settings from '../Settings/Settings.js';
import {fetchGet, jsonizeResponse, consoleError} from '../../modules/fetch.js';
import {renderAppend, renderReplace} from '../../modules/render.js';

export default class Application {
	constructor(element=document.body) {
		this.element = element;
		this.header = new Header(this);
		this.main = new Main(this);
		this.nav = new Nav(this);
		this.auth = new Auth(this);
		this.settings = new Settings(this);
	}

	render = () => {
		fetchGet('/api/auth/isAuthorized')
			.then(jsonizeResponse)
			.catch(consoleError)
			.then(response => {
				if (response.status === 'ok') {
					this.renderSettings();
				} else {
					this.renderAuth();
				}
			})
			.catch(consoleError);
	};

	renderSettings = () => {
		fetchGet('/api/profile/get')
			.then(jsonizeResponse)
			.catch(consoleError)
			.then(response => {
				if (response.status === 'ok') {
					const {firstName, secondName, nickName, avatar, birthDate, sex} = response;
					const userData = {firstName, secondName, nickName, avatar, birthDate, sex};
					this.header.render(renderReplace, nickName, avatar);
					this.main.render(renderAppend);
					this.nav.render(renderAppend);
					this.settings.render(renderAppend, userData);
				} else {
					this.renderAuth();
				}
			})
			.catch(consoleError);
	};

	renderAuth = () => {
		this.header.render(renderReplace);
		this.main.render(renderAppend);
		this.auth.render(renderReplace);
	};

	authorize = () => {
		this.renderSettings();
	};

	signOut = () => {
		this.renderAuth();
	};
}
