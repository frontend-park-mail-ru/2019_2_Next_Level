import {ApplicationRenderState} from './application-utility.js';
import eventBus from '../../modules/event-bus.js';
import {InsertAfterBeginRenderer} from '../../modules/renderer.js';
import {renderFest} from '../../modules/view-utility.js';

import '../common/common-style';
import './application.css';
import './application.tmpl.js';
import routes from '../../modules/routes.js';

export default class ApplicationView {
	/**
	 * @constructor
	 * @param {ApplicationModel} applicationModel
	 */
	constructor(applicationModel) {
		// debugger;
		this.applicationModel = applicationModel;

		routes.forEach(page => {
			// debugger;
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
