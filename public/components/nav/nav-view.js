import {NavRenderSate} from './nav-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import router from '../../modules/router.js';
import {renderFest} from '../../modules/view-utility.js';
import routes from '../../modules/routes.js';

import './nav.css';
import './nav.tmpl.js';

export default class NavView {
	/**
	 * @constructor
	 * @param {NavModel} navModel
	 */
	constructor(navModel) {
		this.navModel = navModel;
		this.currentPage = '/messages/inbox';

		[
			{
				func: this.navModel.dropRenderState,
				pages: routes.GetModuleRoutes('auth'),
			}, {
				func: partial(this.prerender, 'settings', NavRenderSate.RenderedSettings),
				pages: routes.GetModuleRoutes('settings'),
			}, {
				func: partial(this.prerender, 'messages', NavRenderSate.RenderedMessages),
				pages: routes.GetModuleRoutes('messages'),
			},
		].forEach(({func, pages}) => pages.forEach(page => {
			eventBus.addEventListener(`render:${page}`, func);
		}));
		// eventBus.addEventListener('router:reload', this.render);
		console.log('Init nav-view');
	}

	prerender = (page, toRenderState) => {
		// if (this.navModel.renderState !== toRenderState) {
			this.currentPage = page;
			this.render();
		console.log("preRender: nav")
			this.navModel.renderState = toRenderState;
		// }
	};

	render = () => {
		console.log("Render: nav")
		let page = this.currentPage;
		let messages = [];
		routes.GetModuleRoutes('messages').slice(2).forEach(route => {
			messages.push(route.split('/').slice(-1)[0]);
		});
		renderFest(ReplaceInnerRenderer, '.layout__left_nav-wrap', 'components/nav/nav.tmpl', {page, messages});

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
