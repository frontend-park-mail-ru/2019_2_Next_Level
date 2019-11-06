import {ApplicationRenderState} from './application-utility.js';
import eventBus from '../../modules/event-bus.js';
import {InsertAfterBeginRenderer} from '../../modules/renderer.js';
import {addStyleSheetUnsafe, renderFest} from '../../modules/view-utility.js';

import './application.tmpl.js';

export default class ApplicationView {
	/**
	 * @constructor
	 * @param {ApplicationModel} applicationModel
	 */
	constructor(applicationModel) {
		this.applicationModel = applicationModel;

		eventBus.addEventListener('render:auth-sign-in', this.render);
		eventBus.addEventListener('render:auth-sign-up', this.render);
		eventBus.addEventListener('render:settings-user-info', this.render);
		eventBus.addEventListener('render:settings-security', this.render);
	}

	render = () => {
		if (this.applicationModel.renderState === ApplicationRenderState.Rendered) {
			return;
		}

		addStyleSheetUnsafe('components/application/application.css');
		renderFest(InsertAfterBeginRenderer, 'body', 'components/application/application.tmpl');
		this.applicationModel.renderState = ApplicationRenderState.Rendered;
	};
}
