import {ApplicationRenderState} from './application-utility.js';
import eventBus from 'modules/event-bus.js';
import {InsertAfterBeginRenderer} from 'modules/renderer.js';
import {renderFest} from 'modules/view-utility.js';

import '../common/common-style';
import './application.css';
import './application.tmpl.js';
import routes from 'modules/routes.js';
import {ReplaceInnerRenderer} from 'modules/renderer';
import {Config} from '../../config';

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
		// console.log('Init application-view');
	}

	render = () => {
		const height = document.documentElement.clientHeight;
		Config.messagesPerPage = Math.trunc(height/36+1);
		if (this.applicationModel.renderState === ApplicationRenderState.Rendered) {
			return;
		}

		// renderFest(InsertAfterBeginRenderer, 'body', 'components/application/application.tmpl');
		renderFest(ReplaceInnerRenderer, '.application', 'components/application/application.tmpl');
		this.applicationModel.renderState = ApplicationRenderState.Rendered;
		// console.log("Render: application");
	};
}
