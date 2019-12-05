import {MainRenderState} from './main-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {renderFest} from '../../modules/view-utility.js';
import routes from '../../modules/routes.js';

import './main.css';
import './main.tmpl.js';

export default class MainView {
	/**
	 * @constructor
	 * @param {MainModel} mainModel
	 */
	constructor(mainModel) {
		this.mainModel = mainModel;

		[
			{
				func: partial(this.prerender, 'auth', MainRenderState.RenderedAuth),
				// pages: [
				// 	'/auth/sign-in',
				// 	'/auth/sign-up',
				// ],
				pages: routes.GetModuleRoutes('auth'),
			}, {
				func: partial(this.prerender, 'settings', MainRenderState.RenderedSettings),
				pages: routes.GetModuleRoutes('settings'),
			}, {
				func: partial(this.prerender, 'messages', MainRenderState.RenderedMessages),
				// pages: [
				// 	'/messages/compose',
				// 	'/messages/inbox',
				// 	'/messages/sent',
				// 	'/messages/message',
				// ],
				pages: routes.GetModuleRoutes('messages'),
			},
		].forEach(({func, pages}) => {
				// debugger;
				pages.forEach(page => {
					eventBus.addEventListener(`render:${page}`, func);
				});

		});
	}

	prerender = (page, toRenderState) => {
		if (this.mainModel.renderState !== toRenderState) {
			this.render(page);
			this.mainModel.renderState = toRenderState;
		}
	};

	render = page => {
		renderFest(
			ReplaceInnerRenderer,
			'.application__main-wrap',
			'components/main/main.tmpl',
			{page},
		);
	};
}
