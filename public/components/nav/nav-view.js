import {NavRenderSate} from './nav-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {addStyleSheetUnsafe, addStyleSheet, renderFest} from '../../modules/view-utility.js';

import './nav.tmpl.js';


export default class NavView {
	/**
	 * @constructor
	 * @param {NavModel} navModel
	 */
	constructor(navModel) {
		this.navModel = navModel;

		addStyleSheet('/components/common/actions/actions.css');
		addStyleSheet('/components/common/box/box.css');
		addStyleSheetUnsafe('/components/nav/nav.css');

		[
			{
				func: this.navModel.dropRenderState,
				pages: [
					'/auth/sign-in',
					'/auth/sign-up',
				],
			}, {
				func: partial(this.prerender, 'settings', NavRenderSate.RenderedSettings),
				pages: [
					'/settings/user-info',
					'/settings/security',
				],
			}, {
				func: partial(this.prerender, 'messages', NavRenderSate.RenderedMessages),
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
		if (this.navModel.renderState !== toRenderState) {
			this.render(page);
			this.navModel.renderState = toRenderState;
		}
	};

	render = page => {
		renderFest(ReplaceInnerRenderer, '.layout__left_nav-wrap', 'components/nav/nav.tmpl', {page});
	};
}
