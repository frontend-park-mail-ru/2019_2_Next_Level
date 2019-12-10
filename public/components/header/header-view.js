import {HeaderRenderState} from './header-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {renderFest} from '../../modules/view-utility.js';
import routes from '../../modules/routes.js';

import './header.css';
import './header.tmpl.js';

export default class HeaderView {
	/**
	 * @constructor
	 * @param {HeaderModel} headerModel
	 */
	constructor(headerModel) {
		this.headerModel = headerModel;

		[
			{
				func: partial(this.prerender, HeaderRenderState.RenderedAuthorized),
				pages: routes.GetModuleRoutes('messages', 'settings'),
			}, {
				func: partial(this.prerender, HeaderRenderState.RenderedNotAuthorized),
				pages: routes.GetModuleRoutes('auth'),
			},
		].forEach(({func, pages}) => pages.forEach(page => {
			eventBus.addEventListener(`render:${page}`, func);
		}));
	}

	prerender = toRenderState => {
		if (this.headerModel.renderState !== toRenderState) {
			this.render();
			console.log("Render: header")
			this.headerModel.renderState = toRenderState;
		}
	};

	render = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.application__header-wrap',
			'components/header/header.tmpl',
			this.headerModel.userInfo,
		);
	};
}
