import {NavRenderSate} from './nav-utility.js';
import eventBus from '../../modules/event-bus.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {addStyleSheetUnsafe, renderFest} from '../../modules/view-utility.js';

import './nav.tmpl.js';

export default class NavView {
	/**
	 * @constructor
	 * @param {NavModel} navModel
	 */
	constructor(navModel) {
		this.navModel = navModel;

		addStyleSheetUnsafe('components/nav/nav.css');

		eventBus.addEventListener('render:auth-sign-in', this.navModel.dropRenderState);
		eventBus.addEventListener('render:auth-sign-up', this.navModel.dropRenderState);
		eventBus.addEventListener('render:settings-user-info', this.prerenderSettings);
		eventBus.addEventListener('render:settings-security', this.prerenderSettings);
	}

	prerenderSettings = () => {
		switch (this.navModel.renderState) {
		case NavRenderSate.NotRendered:
		case NavRenderSate.RenderedLetters:
			this.renderSettings();
			break;
		case NavRenderSate.RenderedSettings:
			break;
		default:
			console.error('Unknown NavRenderState:', this.navModel.renderState);
			return;
		}
		this.navModel.renderState = NavRenderSate.RenderedSettings;
	};

	renderSettings = () => {
		renderFest(ReplaceInnerRenderer, '.layout__left_nav-wrap', 'components/nav/nav.tmpl', {page: 'settings'});
		// no need to emit replace inner
	};

	renderLetters = () => {
		renderFest(ReplaceInnerRenderer, '.layout__left_nav-wrap', 'components/nav/nav.tmpl', {page: 'letters'});
	};
}
