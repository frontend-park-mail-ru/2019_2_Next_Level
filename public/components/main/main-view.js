import {MainRenderState} from './main-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {addStyleSheetUnsafe, renderFest} from '../../modules/view-utility.js';

import './main.tmpl.js';

export default class MainView {
	/**
	 * @constructor
	 * @param {MainModel} mainModel
	 */
	constructor(mainModel) {
		this.mainModel = mainModel;

		addStyleSheetUnsafe('/components/common/box/box.css');
		addStyleSheetUnsafe('/components/common/layout/layout.css');
		addStyleSheetUnsafe('/components/main/main.css');

		[
			{
				func: partial(this.prerender, 'auth', MainRenderState.RenderedAuth),
				pages: [
					'/auth/sign-in',
					'/auth/sign-up',
				],
			}, {
				func: partial(this.prerender, 'settings', MainRenderState.RenderedSettings),
				pages: [
					'/settings/user-info',
					'/settings/security',
				],
			}, {
				func: partial(this.prerender, 'messages', MainRenderState.RenderedMessages),
				pages: [
					'/messages/compose',
					'/messages/inbox',
					'/messages/sent',
				],
			},
		].forEach(({func, pages}) => pages.forEach(page => {
			eventBus.addEventListener(`render:${page}`, func);
		}));
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
