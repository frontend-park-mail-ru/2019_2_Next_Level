import SignIn from './SignIn/SignIn.js';
import SignUp from './SignUp/SignUp.js';
import {addStyleSheet, renderReplace} from '../../modules/render.js';

export default class Auth {
	constructor(application) {
		this.application = application;

		this.signIn = new SignIn(this);
		this.signUp = new SignUp(this);
	}

	render = renderMethod => {
		renderMethod(document.querySelector('main .layout'), window.fest['components/Auth/Auth.tmpl']());
		addStyleSheet('components/Auth/Auth.css');
		this.signIn.render(renderReplace);
	};

	authorize = () => {
		this.application.authorize();
	}
}
