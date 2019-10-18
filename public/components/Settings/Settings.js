import Security from './Security/Security.js';
import UserInfo from './UserInfo/UserInfo.js';
import {addStyleSheet, renderReplace} from '../../modules/render.js';
import {partial} from '../../modules/partial.js';

export default class Auth {
	constructor(application) {
		this.application = application;

		this.security = new Security(this);
		this.userInfo = new UserInfo(this);
	}

	render = (renderMethod, userData) => {
		renderMethod(document.querySelector('main .layout'), window.fest['components/Settings/Settings.tmpl']());
		addStyleSheet('components/Settings/Settings.css');

		this.userInfo.render(renderReplace, userData);

		// UserInfo link
		document.querySelector('a[name="userInfo"]').addEventListener('click', partial(this.userInfoLinkListener, userData));

		// Security link
		document.querySelector('a[name="security"]').addEventListener('click', this.securityLinkListener);
	};

	signOut = () => {
		this.application.signOut();
	};

	userInfoLinkListener = (userData, e) => {
		e.preventDefault();

		this.userInfo.render(renderReplace, userData);
	};

	securityLinkListener = e => {
		e.preventDefault();

		this.security.render(renderReplace);
	};
}
