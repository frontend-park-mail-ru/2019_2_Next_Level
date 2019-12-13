import {ApplicationRenderState} from './application-utility.js';
import eventBus from 'event-bus.js';
import {InsertAfterBeginRenderer} from 'renderer.js';
import {renderFest} from 'view-utility.js';

import '../common/common-style';
import './application.css';
import './application.tmpl.js';
import routes from 'routes.js';
import {ReplaceInnerRenderer} from 'renderer';

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
