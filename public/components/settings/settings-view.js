import {SettingsRenderState, Events} from './consts.js';
import eventBus from 'modules/event-bus.js';
import {partial} from 'modules/partial.js';
import {ReplaceInnerRenderer} from 'modules/renderer.js';
import {renderFest, abstractDisplayMessage} from 'modules/view-utility.js';
import routes from 'modules/routes.js';

import './__security/settings__security.tmpl.js';
import './__user-info/settings__user-info.tmpl.js';
import './__user_folders/settings__user-folder.tmpl.js';
import {SettingsPages} from './routes.js';
import storage from 'modules/storage';
import Alert from '../common/alert/alert';

export default class SettingsView {
	/**
	 * @constructor
	 * @param {SettingsModel} settingsModel
	 */
	constructor(settingsModel) {
		console.log('Settings-view create');
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
		eventBus.addEventListener('settings/passwordChanged',
			() => Alert.show('Edit password', 'Password succcesfully updated', 'ok', 2000)
		);
		// eventBus.addEventListener('settings:folders-changed', this.renderFolders, 10);
		eventBus.addEventListener('settings:displayFormMessage', SettingsView.displayMessage);
		console.log('Init settings-view');
	}

	prerender = (renderer) => {
		renderer();
	};

	renderUserInfo = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			'components/settings/__user-info/settings__user-info.tmpl',
			storage.get('userInfo'),
		);

		const form = document.querySelector('.form_user-info');
		form.addEventListener('submit', event => {
			event.preventDefault();

			const firstName = form.elements.firstName.value;
			const secondName = form.elements.secondName.value;

			const formData = new FormData();
			const fileField = form.querySelector('input[type="file"]');
			const ava = fileField.files[0] || ''
			formData.append('avatar', ava);
			formData.append('firstName', firstName);
			formData.append('secondName', secondName);
			formData.append('birthDate', '01.01.1000');
			formData.append('sex', 'male');

			// eventBus.emitEvent('settings:user-info-save-button-clicked', {firstName, secondName, nickName, birthDate, sex});
			eventBus.emitEvent('settings:user-info-save-button-clicked', formData);
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
			storage.get('userInfo'),
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
		console.log("RenderFolders");
		console.log('FFF: ', storage.get('userInfo').getFolders());
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_settings-wrap',
			'components/settings/__user_folders/settings__user-folder.tmpl',
			storage.get('userInfo').getFolders(),
		);

		const folderNameInput = document.querySelector('.actions__input_name');
		document.querySelector('.actions__button_create').addEventListener('click', event => {
			event.preventDefault();
			const newFolderName = folderNameInput.value;
			if (newFolderName !== '') {
				eventBus.emitEvent(
					Events.AddFolderButtonCLicked,
					{newFolderName},
				);
			} else {
				eventBus.emitEvent('settings:displayFormMessage', {inputName: 'add', message: 'Empty name'});
				// SettingsView.displayMessage('add', 'Empty name')
			}
		});
		const checkboxes = [...document.querySelectorAll('.datalist-item__checkbox')];

		document.querySelector('.actions__button_delete').addEventListener('click', event => {
			event.preventDefault();
			let ids = [];
			checkboxes.filter(checkbox => checkbox.checked).forEach(checkbox => {
				ids.push(checkbox.className.match(/id-(\w+)/)[1]);
			});
			eventBus.emitEvent(Events.DeleteFolderButtonClicked, ids);
		});

	};


	deleteElement = (elem) => {
		elem.parent.removeChild(elem);
	};

	userInfoDisplayMessage = partial(abstractDisplayMessage, [
		'firstName',
		'secondName',
	]);

	securityDisplayMessage = partial(abstractDisplayMessage, [
		'currentPassword',
		'newPassword',
		'newPasswordAgain',
	]);

	onUserInfoEdited = () => {
		// this.userInfoDisplayMessage({inputName: 'sex', message: ''});
		eventBus.emitEvent('application:load_userdata');
		Alert.show('Edit', 'User info edited successful', 'ok', 200000);
	};

	static displayMessage({inputName, message}) {
		console.log('displayMessage', inputName, message);
		document.querySelector(`.form__message_${inputName}`).innerText = message;
	}
}
