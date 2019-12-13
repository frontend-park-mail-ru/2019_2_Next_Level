import {ApplicationRenderState} from './application-utility.js';
import eventBus from 'public/modules/event-bus.js';
import {InsertAfterBeginRenderer} from 'public/modules/renderer.js';
import {renderFest} from 'public/modules/view-utility.js';

import '../common/common-style';
import './application.css';
import './application.tmpl.js';
import routes from 'public/modules/routes.js';
import {ReplaceInnerRenderer} from 'public/modules/renderer';

export default class ApplicationView {
	/**
	 * @constructor
	 * @param {ApplicationModel} applicationModel
	 */
	constructor(applicationModel) {
		this.applicationModel = applicationModel;

		routes.forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.render);
		});
		console.log('Init application-view');
	}

	render = () => {
		if (this.applicationModel.renderState === ApplicationRenderState.Rendered) {
			return;
		}

		// renderFest(InsertAfterBeginRenderer, 'body', 'components/application/application.tmpl');
		renderFest(ReplaceInnerRenderer, 'body', 'components/application/application.tmpl');
		this.applicationModel.renderState = ApplicationRenderState.Rendered;
		console.log("Render: application");
	};
}
