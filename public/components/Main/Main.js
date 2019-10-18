import {addStyleSheet} from '../../modules/render.js';

export default class Main {
	constructor(application) {
		this.application = application;
	}

	render = renderMethod => {
		renderMethod(this.application.element, window.fest['components/Main/Main.tmpl']());
		addStyleSheet('components/Main/Main.css');
	};
}
