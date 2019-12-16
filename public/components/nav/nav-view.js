import {NavRenderSate} from './nav-utility.js';
import eventBus from 'modules/event-bus.js';
import {partial} from 'modules/partial.js';
import {ReplaceInnerRenderer} from 'modules/renderer.js';
import router from 'modules/router.js';
import {renderFest} from 'modules/view-utility.js';
import routes from 'modules/routes.js';
import storage from 'modules/storage';


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
		console.log("preRender: nav");
		this.navModel.renderState = toRenderState;
		// }
	};

	render = () => {
		console.log("Render: nav");
		let page = this.currentPage;
		let messages = [];
		routes.GetModuleRoutes('messages').slice(3).forEach(route => {
			messages.push(route.split('/').slice(-1)[0]);
		});
		const userData = storage.get('userInfo');
		renderFest(ReplaceInnerRenderer, '.layout__left_nav-wrap', 'components/nav/nav.tmpl', {page, messages, nickname: userData.nickName, avatar: userData.avatar, authorized: storage.get('authState')});

		if (page === 'auth') {
			return;
		}

		const nav = document.querySelector('.nav');


		const toogleNav = () => {
			if (window.innerWidth < 765) {
				let nav = document.getElementsByClassName('layout__left_nav-wrap')[0];
				nav.classList.toggle('layout__left_nav-wrap_active');
			}
		};

		nav.addEventListener('click', toogleNav);
	};
}
