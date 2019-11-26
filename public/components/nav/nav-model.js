import {NavRenderSate} from './nav-utility.js';

export default class NavModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.dropRenderState();
	}

	dropRenderState = () => {
		this.renderState = NavRenderSate.NotRendered;
	};
}
