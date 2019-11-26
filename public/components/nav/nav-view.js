import {NavRenderSate} from './nav-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import router from '../../modules/router.js';
import {renderFest} from '../../modules/view-utility.js';

import './nav.css';
import './nav.tmpl.js';

export default class NavView {
	/**
	 * @constructor
	 * @param {NavModel} navModel
	 */
	constructor(navModel) {
		this.navModel = navModel;

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
					'/messages/message',
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

		if (page === 'auth') {
			return;
		}

		document.querySelector('.actions__button_compose').addEventListener('click', event => {
			event.preventDefault();

			if (window.location.pathname === '/messages/compose') {
				if (confirm('The body of your email will be lost.')) {
					eventBus.emitEvent('rerender:/messages/compose');
				}
				return;
			}

			router.routeNew({}, '', '/messages/compose');
		});
	};
}
