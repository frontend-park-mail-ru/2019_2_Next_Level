import HeaderModel from './header-model.js';
import HeaderView from './header-view.js';

export default class HeaderController {
	/**
	 * @constructor
	 */
	constructor() {
		this.headerModel = new HeaderModel();
		this.headerView = new HeaderView(this.headerModel);
	}

	render = () => {
		this.headerView.render();
	};
}
