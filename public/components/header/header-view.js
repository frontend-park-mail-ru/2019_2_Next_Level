import {HeaderRenderState} from './header-utility.js';
import eventBus from 'modules/event-bus.js';
import {partial} from 'modules/partial.js';
import {ReplaceInnerRenderer} from 'modules/renderer.js';
import {renderFest} from 'modules/view-utility.js';
import routes from 'modules/routes.js';
import router from 'modules/router.js';
import storage from 'modules/storage';

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
		const userData = storage.get('userInfo');
		console.log("Header: ", storage.get('authState'));
		renderFest(
			ReplaceInnerRenderer,
			'.application__header-wrap',
			'components/header/header.tmpl',
			{nickname: userData.nickName, avatar: userData.avatar, authorized: storage.get('authState')},
			// this.headerModel.userInfo,
		);

		if (storage.get('authState')) {
			let searchForm = document.getElementsByClassName('header__search__form')[0];
			searchForm.addEventListener('submit', event => {
				event.preventDefault();
				const query = searchForm.elements.query.value;
				eventBus.emitEvent('header:search', {query});
			});

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

			document.querySelector('.nav_icon').addEventListener('click', event => {
				event.preventDefault();

				let nav = document.getElementsByClassName('layout__left_nav-wrap')[0];
				nav.classList.toggle('layout__left_nav-wrap_active');
				nav.focus();
			});
		}
	};
}
