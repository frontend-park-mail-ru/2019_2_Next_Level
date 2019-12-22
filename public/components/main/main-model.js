import {MainRenderState} from './main-utility.js';
import eventBus from 'modules/event-bus.js';

export default class MainModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.renderState = MainRenderState.NotRendered;
		// this.authorized = undefined;
		//
		// eventBus.addEventListener('application:authorized', this.onAuthorized);
		// eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);
	}

	// onAuthorized = () => {
	// 	this.authorized = true;
	// };

	// onNotAuthorized = () => {
	// 	this.authorized = false;
	// }
}
