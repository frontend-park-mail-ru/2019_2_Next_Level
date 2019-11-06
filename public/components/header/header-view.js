import {HeaderRenderState} from './header-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {addStyleSheetUnsafe, renderFest} from '../../modules/view-utility.js';

import './header.tmpl.js';

export default class HeaderView {
	/**
	 * @constructor
	 * @param {HeaderModel} headerModel
	 */
	constructor(headerModel) {
		this.headerModel = headerModel;

		eventBus.addEventListener('render:auth-sign-in', partial(this.render, HeaderRenderState.RenderedNotAuthorized));
		eventBus.addEventListener('render:auth-sign-up', partial(this.render, HeaderRenderState.RenderedNotAuthorized));
		eventBus.addEventListener('render:settings-user-info', partial(this.render, HeaderRenderState.RenderedAuthorized));
		eventBus.addEventListener('render:settings-security', partial(this.render, HeaderRenderState.RenderedAuthorized));

		addStyleSheetUnsafe('components/header/header.css');
	}

	render = renderState => {
		if (renderState !== this.headerModel.renderState) {
			renderFest(ReplaceInnerRenderer, '.application', 'components/header/header.tmpl', this.headerModel.userInfo);
			eventBus.emitEvent('application:replace-inner');

			this.headerModel.renderState = this.headerModel.userInfo.authorized ? HeaderRenderState.RenderedAuthorized : HeaderRenderState.RenderedNotAuthorized;
		}
	};
}
