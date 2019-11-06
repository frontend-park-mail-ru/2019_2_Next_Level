import {MainRenderState} from './main-utility.js';
import eventBus from '../../modules/event-bus.js';
import {InsertBeforeEndRenderer, InplaceRenderer} from '../../modules/renderer.js';
import {addStyleSheetUnsafe, renderFest} from '../../modules/view-utility.js';

import './main.tmpl.js';

export default class MainView {
	/**
	 * @constructor
	 * @param {MainModel} mainModel
	 */
	constructor(mainModel) {
		this.mainModel = mainModel;

		addStyleSheetUnsafe('components/common/box/box.css');
		addStyleSheetUnsafe('components/common/layout/layout.css');
		addStyleSheetUnsafe('components/main/main.css');

		eventBus.addEventListener('render:auth-sign-in', this.renderAuthLayout);
		eventBus.addEventListener('render:auth-sign-up', this.renderAuthLayout);
		eventBus.addEventListener('render:settings-user-info', this.renderSettingsLayout);
		eventBus.addEventListener('render:settings-security', this.renderSettingsLayout);
	}

	render = () => {
		switch (this.mainModel.authorized) {
		case false:
			this.renderAuthLayout();
			break;
		case true:
			this.renderSettingsLayout();
			break;
		default:
			console.error('Unknown mainModel.authorized:', this.mainModel.authorized);
		}
	};

	renderAuthLayout = () => {
		switch (this.mainModel.renderState) {
		case MainRenderState.NotRendered:
			renderFest(InsertBeforeEndRenderer, '.application', 'components/main/main.tmpl', {page: 'auth'});
			break;
		case MainRenderState.RenderedAuth:
			break;
		case MainRenderState.RenderedSettings:
		case MainRenderState.RenderedLetters:
			renderFest(InplaceRenderer, '.main', 'components/main/main.tmpl', {page: 'auth'});
			break;
		default:
			console.error('Unknown render state:', this.mainModel.renderState);
		}
		this.mainModel.renderState = MainRenderState.RenderedAuth;
	};

	renderSettingsLayout = () => {
		switch (this.mainModel.renderState) {
		case MainRenderState.NotRendered:
			renderFest(InsertBeforeEndRenderer, '.application', 'components/main/main.tmpl', {page: 'settings'});
			break;
		case MainRenderState.RenderedSettings:
			break;
		case MainRenderState.RenderedAuth:
		case MainRenderState.RenderedLetters:
			renderFest(InplaceRenderer, '.main', 'components/main/main.tmpl', {page: 'settings'});
			break;
		default:
			console.error('Unknown render state:', this.mainModel.renderState);
		}
		this.mainModel.renderState = MainRenderState.RenderedSettings;
	};
}
