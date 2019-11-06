import {HeaderRenderState} from './header-utility.js';
import eventBus from '../../modules/event-bus.js';

export default class HeaderModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.renderState = HeaderRenderState.NotRendered;

		eventBus.addEventListener('application:authorized', this.onAuthorized);
		eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);
	}

	onAuthorized = userInfo => {
		this.userInfo = {
			authorized: true,
			nickName: userInfo.nickName,
			avatar: userInfo.avatar,
		};
	};

	onNotAuthorized = () => {
		this.userInfo = {
			authorized: false,
		};

		console.log(this.userInfo);
	};
}
