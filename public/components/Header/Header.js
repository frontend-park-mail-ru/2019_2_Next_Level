import {addStyleSheet} from '../../modules/render.js';

export default class Header {
	constructor(application) {
		this.application = application;
	}

	render = (renderMethod, nickName, avatar) => {
		renderMethod(this.application.element, window.fest['components/Header/Header.tmpl']({authorized: nickName !== undefined, nickName, avatar}));
		addStyleSheet('components/Header/Header.css');

		const profileWrap = document.querySelector('.profile-wrap');
		if (profileWrap !== null) {
			/* doesn't work for no reason */
			profileWrap.addEventListener('click', e => {
				e.preventDefault();
				document.querySelector('.profile__menu').classList.toggle('active');
			});
		}
	};
}
