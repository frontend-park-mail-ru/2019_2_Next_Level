import {addStyleSheet} from '../../modules/render.js';

export default class Nav {
	constructor(application) {
		this.application = application;
	}

	render = renderMethod => {
		renderMethod(document.querySelector('main .layout'), window.fest['components/Nav/Nav.tmpl']());
		addStyleSheet('components/Nav/Nav.css');
	};
}
