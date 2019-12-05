import {SettingsRenderState} from './settings-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {renderFest, abstractDisplayMessage} from '../../modules/view-utility.js';
import routes from '../../modules/routes.js';

import './__security/settings__security.tmpl.js';
import './__user-info/settings__user-info.tmpl.js';
import './__user_folders/settings__user-folder.tmpl.js';

export default class SettingsView {
	/**
	 * @constructor
	 * @param {SettingsModel} settingsModel
	 */
	constructor(settingsModel) {
		this.settingsModel = settingsModel;

		routes.GetModuleRoutes('auth', 'messages').forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.settingsModel.dropRenderState);
		});

		[
			{
				page: 'user-info',
				renderer: this.renderUserInfo,
				renderState: SettingsRenderState.RenderedUserInfo,
			}, {
				page: 'security',
				renderer: this.renderSecurity,
				renderState: SettingsRenderState.RenderedSecurity,
			}, {
				page: 'folders',
				renderer: this.renderFolders,
				renderState: SettingsRenderState.RenderFolders,
			},
		].forEach(({page, renderer, renderState}) => {
			eventBus.addEventListener(`render:/settings/${page}`, partial(this.prerender, renderer, renderState));
		});

		eventBus.addEventListener('settings:user-info-validate', this.userInfoDisplayMessage);
		eventBus.addEventListener('settings:security-validate', this.securityDisplayMessage);

		eventBus.addEventListener('settings:user-info-edited', this.onUserInfoEdited);
	}

	prerender = (renderer, toRenderState) => {
		if (this.settingsModel.renderState !== toRenderState) {
			renderer();
			this.settingsModel.renderState = toRenderState;
		}
	};

	renderUserInfo = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			'components/settings/__user-info/settings__user-info.tmpl',
			this.settingsModel.userInfo,
		);

		const form = document.querySelector('.form_user-info');
		form.addEventListener('submit', event => {
			event.preventDefault();

			const firstName = form.elements.firstName.value;
			const secondName = form.elements.secondName.value;
			const nickName = form.elements.nickName.value;
			const birthDate = form.elements.birthDate.value;
			const sex = form.elements.sex.value;

			eventBus.emitEvent('settings:user-info-save-button-clicked', {firstName, secondName, nickName, birthDate, sex});
		});

		document.querySelector('.form__button_cancel').addEventListener('click', event => {
			event.preventDefault();
			if (confirm('Changes will be lost')) {
				this.renderUserInfo();
			}
		});
	};

	renderSecurity = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			'components/settings/__security/settings__security.tmpl',
			this.settingsModel.userInfo,
		);

		const form = document.querySelector('.form_security');
		form.addEventListener('submit', event => {
			event.preventDefault();

			const currentPassword = form.elements.currentPassword.value;
			const newPassword = form.elements.newPassword.value;
			const newPasswordAgain = form.elements.newPasswordAgain.value;

			eventBus.emitEvent('settings:security-save-button-clicked', {currentPassword, newPassword, newPasswordAgain});
		});

		document.querySelector('.form__button_cancel').addEventListener('click', event => {
			event.preventDefault();
			if (confirm('Changes will be lost')) {
				this.renderSecurity();
			}
		});
	};

	renderFolders = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			'components/settings/__user_folders/settings__user-folder.tmpl',
			this.settingsModel.userInfo,
		)

		// document.querySelector('.form__button_cancel').addEventListener('click', event => {
		// 	event.preventDefault();
		// 	if (confirm('Changes will be lost')) {
		// 		this.renderSecurity();
		// 	}
		// });
	}

	userInfoDisplayMessage = partial(abstractDisplayMessage, [
		'firstName',
		'secondName',
		'nickName',
		'birthDate',
		'sex',
	]);

	securityDisplayMessage = partial(abstractDisplayMessage, [
		'currentPassword',
		'newPassword',
		'newPasswordAgain',
	]);

	onUserInfoEdited = () => {
		this.userInfoDisplayMessage({inputName: 'sex', message: ''});
		alert('User info edited successful');
	}
}
