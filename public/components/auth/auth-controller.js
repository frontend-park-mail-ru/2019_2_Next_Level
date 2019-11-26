import AuthModel from './auth-model.js';
import AuthView from './auth-view.js';

export default class AuthController {
	/**
	 * @constructor
	 */
	constructor() {
		this.authModel = new AuthModel();
		this.authView = new AuthView(this.authModel);
	}

	// once upon a time i tried use sync functions

	render = page => {
		switch (page) {
		case 'sign-in':
			this.authView.renderSignIn();
			break;
		case 'sign-up':
			this.authView.renderSignUp();
			break;
		default:
			console.error(`Unknown page: ${page}`);
		}
	};

	// renderSingIn = () => {
	// 	this.authView.renderSignIn();
	// };
	//
	// renderSignUp = () => {
	// 	this.authView.renderSignUp();
	// };
}
