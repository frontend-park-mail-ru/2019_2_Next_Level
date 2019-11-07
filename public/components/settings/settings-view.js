import {SettingsRenderState} from './settings-utility.js';
import Form from '../common/form/form.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {renderFest, addStyleSheet, eventBusEmitter} from '../../modules/view-utility.js';

import './__security-form/settings__security-form.tmpl.js';
import './__user-info-form/settings__user-info-form.tmpl.js';

export default class SettingsView {
	/**
	 * @constructor
	 * @param {SettingsModel} settingsModel
	 */
	constructor(settingsModel) {
		this.settingsModel = settingsModel;

		addStyleSheet('/components/common/form/form.css');

		[
			'/auth/sign-in',
			'/auth/sign-up',
			'/messages/compose',
			'/messages/inbox',
			'/messages/sent',
		].forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.settingsModel.dropRenderState);
		});

		[
			{
				page: 'user-info',
				renderState: SettingsRenderState.RenderedUserInfo,
			}, {
				page: 'security',
				renderState: SettingsRenderState.RenderedSecurity,
			},
		].forEach(({page, renderState}) => {
			eventBus.addEventListener(`render:/settings/${page}`, partial(this.prerender, page, renderState));
		});

		eventBus.addEventListener('settings:user-info-cancel-button-clicked', partial(this.render, 'user-info'));
		eventBus.addEventListener('settings:security-cancel-button-clicked', partial(this.render, 'security'));
	}

	prerender = (page, toRenderState) => {
		if (this.settingsModel.renderState !== toRenderState) {
			this.render(page);
			this.settingsModel.renderState = toRenderState;
		}
	};

	render = page => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			`components/settings/__${page}-form/settings__${page}-form.tmpl`,
			this.settingsModel.userInfo,
		);

		eventBusEmitter('.form__button_save', 'click', `settings:${page}-save-button-clicked`); // hmm maybe simple addEventListener to button hmm
		eventBusEmitter('.form__button_cancel', 'click', `settings:${page}-cancel-button-clicked`);
	}
}
