import {SettingsRenderState} from './consts.js';
import {Errors} from 'modules/errors.es6.inc.js';
import eventBus from 'modules/event-bus.js';
import {jsonize, fetchPost, consoleError} from 'modules/fetch.js';
import {checkName, checkNickName, checkDate, checkSex, checkPassword} from 'modules/validate.es6.inc.js';
import {Events} from './consts';
import {partial} from 'modules/partial';
import {fetchGet, fetchFile} from 'modules/fetch';
import router from 'modules/router';
import {SettingsPages} from './routes';
import storage from 'modules/storage';
import {UserInfo} from 'modules/userInfo';
import form from '../common/form/form';
import {Folder} from '../../modules/folder';

export default class SettingsModel {
	/**
	 * @constructor
	 */
	constructor() {
		console.log('Settings-model create');
		this.dropRenderState();

		eventBus.addEventListener('application:authorized', this.onAuthorized);
		eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);

		// debugger;
		eventBus.addEventListener('settings:user-info-save-button-clicked', this.onUserInfoSaveButtonClicked);
		eventBus.addEventListener('settings:security-save-button-clicked', this.onSecuritySaveButtonClicked);
		eventBus.addEventListener(Events.DeleteFolderButtonClicked, this.onDeleteFolderButtonClicked);
		eventBus.addEventListener(Events.AddFolderButtonCLicked, this.onAddFolderButtonClicked);
		// console.log('Init settings-model');
	}

	getFolders = () => {
		return storage.get('userInfo').folders;
		// if (!this.userInfo) {
		// 	//debugger;
		// 	console.log("Empty folders")
		// 	return SettingsPages;
		// }
		// console.log("Folders", storage.get('userInfo').folders);
		// return this.userInfo.folders;
	};

	dropRenderState = () => {
		this.renderState = SettingsRenderState.NotRendered;
	};

	onAuthorized = userInfo => {
		// this.userInfo = userInfo;
		// console.log('Add userinfo to Settings.model', userInfo);
		// запрос на перезапись маршрутов в Messages
		eventBus.emitEvent('settings:folders-changed', storage.get('userInfo').folders);
	};

	onNotAuthorized = () => {
		this.userInfo = {};
	};

	// onUserInfoSaveButtonClicked = ({firstName, secondName, nickName, birthDate, sex}) => {
	onUserInfoSaveButtonClicked = (formData) => {
		const checks = [
			{check: checkName, variable: formData.get('firstName'), name: 'firstName', msg: 'Wrong first name!'},
			{check: checkName, variable: formData.get('secondName'), name: 'secondName', msg: 'Wrong second name!'},
			// {check: checkDate, variable: formData.get('birthDate'), name: 'birthDate', msg: 'Wrong birth date!'},
			// {check: checkSex, variable: formData.get('sex'), name: 'sex', msg: 'Wrong sex!'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				eventBus.emitEvent('settings:user-info-validate', {inputName: c.name, message: c.msg});
				return;
			}
		}

		// const userInfo = {firstName, secondName, nickName, avatar: null, birthDate, sex};
		jsonize(fetchFile('/api/profile/editUserInfo', formData)).then(response => {
			if (response.status === 'ok') {
				// storage.set('userInfo', new UserInfo(userInfo));

				eventBus.emitEvent('settings:user-info-edited');
				eventBus.emitEvent('render:/settings/user-info');
				return;
			}

			let inputName = '';
			switch (response.error.code) {
			case Errors.NotAuthorized:
				eventBus.emitEvent('application:sign-out');
				break;
			case Errors.InvalidFirstName.code:
				inputName = 'firstName';
				break;
			case Errors.InvalidSecondName.code:
				inputName = 'secondName';
				break;
			case Errors.InvalidNickName.code:
				inputName = 'nickName';
				break;
			default:
				console.error('Unknown response:', response);
				return;
			}
			eventBus.emitEvent('settings:user-info-validate', {inputName, message: response.error.msg});
		}).catch(consoleError);
	};

	onSecuritySaveButtonClicked = ({currentPassword, newPassword, newPasswordAgain}) => {
		const checks = [
			{check: checkPassword, variable: currentPassword, name: 'currentPassword', msg: 'Wrong password'},
			{check: checkPassword, variable: newPassword, name: 'newPassword', msg: 'Wrong password'},
			{check: () => newPassword === newPasswordAgain, name: 'newPasswordAgain', msg: 'Passwords do not match'},
		];

		for (let c of checks) {
			if (!c.check(c.variable)) {
				eventBus.emitEvent('settings:security-validate', {inputName: c.name, message: c.msg});
				return;
			}
		}

		jsonize(fetchPost('/api/profile/editPassword', {currentPassword, newPassword})).then(response => {
			if (response.status === 'ok') {
				eventBus.emitEvent('settings:security-validate', {inputName: 'newPassword', message: ''});
				eventBus.emitEvent('settings/passwordChanged', {});
				eventBus.emitEvent('settings:edit-password');
				return;
			}

			let inputName = '';
			switch (response.error.code) {
			case Errors.NotAuthorized:
				eventBus.emitEvent('application:sign-out');
				break;
			case Errors.WrongPassword.code:
				inputName = 'currentPassword';
				break;
			case Errors.InvalidPassword.code:
				inputName = 'newPassword';
				break;
			case Errors.SamePasswords.code:
				inputName = 'newPassword';
				break;
			default:
				console.error('Unknown response:', response);
				return;
			}
			eventBus.emitEvent('settings:security-validate', {inputName, message: response.error.msg});
		}).catch(consoleError);
	};

	onAddFolderButtonClicked = ({newFolderName}) => {
		console.log('Add');
		jsonize(fetchPost(`/api/messages/addFolder/${newFolderName}`, {})).then(response => {
			if (response.status === 'ok') {
				let localUserInfo = storage.get('userInfo');
				localUserInfo.addFolder(new Folder(newFolderName));
				storage.set('userInfo', localUserInfo);

				eventBus.emitEvent('settings:folders-changed', storage.get('userInfo').folders);
				return;
			}
			switch (response.error.code) {
			case Errors.NotAuthorized.code:
				eventBus.emitEvent('application:sign-out');
				break;
			case Errors.AlreadyExists.code:
			case Errors.InvalidRequest.code:
				eventBus.emitEvent('settings:displayFormMessage', {inputName: 'add', message: 'Folder already exists'});
				break;
			default:
				eventBus.emitEvent('settings:displayFormMessage', {inputName: 'add', message: 'Unknown error. Try later.'});
				console.error('Unknown response:', response);
				return;
			}

		}).catch(consoleError);
	};

	onDeleteFolderButtonClicked = (folderName) => {
		const folderExceptions = ['sent', 'inbox', 'spam', 'proceed', 'trash'];
		folderName.forEach(name => {
			if (folderExceptions.includes(name)) {
				console.log('Folder exception');
				return;
			}
 			jsonize(fetchPost(`/api/messages/deleteFolder/${name}`, {})).then(response => {
				if (response.status === 'ok') {
					let localUserInfo = storage.get('userInfo');
					localUserInfo.deleteFolderByName(name);
					storage.set('userInfo', localUserInfo);

					eventBus.emitEvent('settings:folders-changed', storage.get('userInfo').folders);
				} else {
					switch (response.error.code) {
					case Errors.NotAuthorized:
						eventBus.emitEvent('application:sign-out');
						break;
					case Errors.NotExist:
						eventBus.emitEvent('settings:security-validate', {
							inputName: 'folder name',
							message: 'Folder does not exist',
						});
						break;
					default:
						console.error('Unknown response:', response);
						return;
					}
				}
			}).catch(consoleError);
		});
	};
}
