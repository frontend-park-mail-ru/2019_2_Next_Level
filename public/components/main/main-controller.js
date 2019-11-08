import MainModel from './main-model.js';
import MainView from './main-view.js';
import AuthController from '../auth/auth-controller.js';
import NavController from '../nav/nav-controller.js';
import SettingsController from '../settings/settings-controller.js';
import MessagesController from '../messages/messages-controller.js';

export default class MainController {
	/**
	 * @constructor
	 */
	constructor() {
		this.mainModel = new MainModel();
		this.mainView = new MainView(this.mainModel);

		this.authController = new AuthController();
		this.navController = new NavController();
		this.settingsController = new SettingsController();
		this.messagesController = new MessagesController();
	}

	// render = () => {
	// 	this.mainView.render();
	// };

	// old but hmm

	renderAuth = page => {
		this.mainView.renderAuthLayout();
		this.authController.render(page);
	};

	renderSettings = page => {
		this.mainView.renderSettingsLayout();
		this.navController.render(page);
		this.settingsController.render(page);
	};
}
