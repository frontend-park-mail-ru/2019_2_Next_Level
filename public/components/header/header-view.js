import {HeaderRenderState} from './header-utility.js';
import eventBus from 'public/modules/event-bus.js';
import {partial} from 'public/modules/partial.js';
import {ReplaceInnerRenderer} from 'public/modules/renderer.js';
import {renderFest} from 'public/modules/view-utility.js';
import routes from 'public/modules/routes.js';
import storage from 'public/modules/storage';

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
		}
	};
}
