import NavModel from './nav-model.js';
import NavView from './nav-view.js';

export default class NavController {
	/**
	 * @constructor
	 */
	constructor() {
		this.navModel = new NavModel();
		this.navView = new NavView(this.navModel);
	}
}
