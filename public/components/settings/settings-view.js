import {SettingsRenderState} from './settings-utility.js';
import Form from '../common/form/form.js';
import eventBus from '../../modules/event-bus.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {renderFest, addStyleSheet} from '../../modules/view-utility.js';

import './__security-form/settings__security-form.tmpl.js';
import './__user-info-form/settings__user-info-form.tmpl.js';

export default class SettingsView {
	/**
	 * @constructor
	 * @param {SettingsModel} settingsModel
	 */
	constructor(settingsModel) {
		this.settingsModel = settingsModel;

		// TODO: add / in all addStyleSheet (if here works);
		addStyleSheet('/components/common/form/form.css');

		eventBus.addEventListener('render:auth-sign-in', this.settingsModel.dropRenderState);
		eventBus.addEventListener('render:auth-sign-up', this.settingsModel.dropRenderState);
		eventBus.addEventListener('render:settings-user-info', this.prerenderUserInfo);
		eventBus.addEventListener('render:settings-security', this.prerenderSecurity);
	}

	prerenderUserInfo = () => {
		switch (this.settingsModel.renderState) {
		case SettingsRenderState.NotRendered:
		case SettingsRenderState.RenderedSecurity:
			this.renderUserInfo();
			break;
		case SettingsRenderState.RenderedUserInfo:
			break;
		default:
			console.error('Unknown SettingsRenderState:', this.settingsModel.renderState);
		}
		this.settingsModel.renderState = SettingsRenderState.RenderedUserInfo;
	};

	prerenderSecurity = () => {
		switch (this.settingsModel.renderState) {
		case SettingsRenderState.NotRendered:
		case SettingsRenderState.RenderedUserInfo:
			this.renderSecurity();
			break;
		case SettingsRenderState.RenderedSecurity:
			break;
		default:
			console.error('Unknown SettingsRenderState:', this.settingsModel.renderState);
		}
		this.settingsModel.renderState = SettingsRenderState.RenderedSecurity;
	};

	renderUserInfo = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			'components/settings/__user-info-form/settings__user-info-form.tmpl',
			this.settingsModel.userInfo,
		);
	};

	renderSecurity = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			'components/settings/__security-form/settings__security-form.tmpl',
		);
	};
}
