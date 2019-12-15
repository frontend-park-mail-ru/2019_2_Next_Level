import {MainRenderState} from './main-utility.js';
import eventBus from 'modules/event-bus.js';
import {partial} from 'modules/partial.js';
import {ReplaceInnerRenderer} from 'modules/renderer.js';
import {renderFest} from 'modules/view-utility.js';
import routes from 'modules/routes.js';

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
				pages: routes.GetModuleRoutes('auth'),
			}, {
				func: partial(this.prerender, 'settings', MainRenderState.RenderedSettings),
				pages: routes.GetModuleRoutes('settings'),
			}, {
				func: partial(this.prerender, 'messages', MainRenderState.RenderedMessages),
				pages: routes.GetModuleRoutes('messages'),
			},{
				func: partial(this.prerender, 'offline', MainRenderState.RenderOffline),
				pages: ['/offline'],
			},
		].forEach(({func, pages}) => {
				pages.forEach(page => {
					eventBus.addEventListener(`render:${page}`, func);
				});

		});
	}

	prerender = (page, toRenderState) => {
		if (this.mainModel.renderState !== toRenderState) {
			this.render(page);
			console.log("Render: main")
			this.mainModel.renderState = toRenderState;
		}
	};

	render = page => {
		console.log('Render page ', page);
		renderFest(
			ReplaceInnerRenderer,
			'.application__main-wrap',
			'components/main/main.tmpl',
			{page},
		);
	};
}
