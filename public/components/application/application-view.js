import {ApplicationRenderState} from './application-utility.js';
import eventBus from '../../modules/event-bus.js';
import {InsertAfterBeginRenderer} from '../../modules/renderer.js';
import {renderFest} from '../../modules/view-utility.js';

import '../common/common-style';
import './application.css';
import './application.tmpl.js';

export default class ApplicationView {
	/**
	 * @constructor
	 * @param {ApplicationModel} applicationModel
	 */
	constructor(applicationModel) {
		this.applicationModel = applicationModel;

		[
			'/auth/sign-in',
			'/auth/sign-up',
			'/settings/user-info',
			'/settings/security',
			'/messages/compose',
			'/messages/inbox',
			'/messages/sent',
			'/messages/message',
		].forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.render);
		});
	}

	render = () => {
		if (this.applicationModel.renderState === ApplicationRenderState.Rendered) {
			return;
		}

		renderFest(InsertAfterBeginRenderer, 'body', 'components/application/application.tmpl');
		this.applicationModel.renderState = ApplicationRenderState.Rendered;
	};
}
