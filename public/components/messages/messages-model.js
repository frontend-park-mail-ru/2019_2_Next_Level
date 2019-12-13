import {MessagesRenderState} from './messages-utility.js';
import {Errors} from 'modules/errors.es6.inc.js';
import eventBus from 'modules/event-bus.js';
import {jsonize, fetchGetWithParams, fetchPost, consoleError} from 'modules/fetch.js';
import {partial} from 'modules/partial.js';
import {checkEmail} from 'modules/validate.es6.inc.js';
import {MessagesPages} from './routes';
import storage from 'modules/storage';
import {Config} from 'config.js';

export default class MessagesModel {
	/**
	 * @constructor
	 */
	constructor() {
		console.log('Messages-model create');
		this.onNotAuthorized();

		eventBus.addEventListener('application:authorized', this.onAuthorized);
		eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);

		eventBus.addEventListener('messages:compose-send-button-clicked', this.onComposeSendButtonClicked);

		eventBus.addEventListener('messages:read-button-clicked', partial(this.toggleMessageState, 'read'));
		eventBus.addEventListener('messages:unread-button-clicked', partial(this.toggleMessageState, 'unread'));
		eventBus.addEventListener('messages:delete-button-clicked', this.deleteMessage);

		// слушатели для получения сообщений при переходе на соответствующую страницу
		for (let link of MessagesPages.slice(3)) {
			const name = link.split('/').splice(-1)[0];	// перевернули массив и взяли первый элемент результата
			// при запросе на переход к странице папки запрашиваем список писем, затем требуем перерисовки страницы.

			eventBus.addEventListener(`prerender:${link}`, () => {
				console.log('MessagesModel');
				eventBus.addSporadicEventListener(`folder.onload/${name}`, () => eventBus.emitEvent(`render:${link}`));
				this.loadFolder(name, 1);
			}, 10);
			console.log('LoadMessage ', name);
		}

		eventBus.addEventListener('messages:move_messages', this.moveMessage);
		eventBus.addEventListener('messages:loadnewpage', ({page, folder}) => {
			this.loadFolder(folder, page);
		});
		eventBus.addEventListener('application:getMessagesById', this.loadMessagesById);
	}

	dropRenderState = () => {
		this.renderState = MessagesRenderState.NotRendered;
	};

	transformDate = (message, now) => {
		const d = new Date(message.date);
		if (d.getFullYear() === now.getFullYear()) {
			if (d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
				message.date = `${d.getHours()}:${d.getMinutes()}`;
			} else {
				const dateString = d.toDateString().split(' ');
				message.date = `${dateString[1]} ${dateString[2]}`;
			}
		} else {
			message.date = d.toLocaleDateString('ru-RU');
		}
	};

	loadFolder = (folder, page=1) => {
		console.log( Config.messagesPerPage);
		this.updateFolderMessages(folder, page, Config.messagesPerPage);
	};

	onAuthorized = userInfo => {
		this.userInfo = userInfo;
		console.log('Add userinfo to MessageModel ', userInfo);
	};

	onNotAuthorized = () => {
		this.dropRenderState();

		this.userInfo = {};
		this.folders = {
			inbox: {
				messages: [],
			},
			sent: {
				messages: [],
			},
		};
	};

	onComposeSendButtonClicked = ({to, subject, content}) => {
		if (/,/.test(to)) {
			to = to.trim().split(/,\s*/);
		} else {
			to = to.trim().split(/\s+/);
		}
		for (let email of to) {
			if (!checkEmail(email)) {
				eventBus.emitEvent('messages:compose-validate', `Wrong email: ${email}`);
				return;
			}
		}

		if (!subject.trim().length) {
			eventBus.emitEvent('messages:compose-validate', {msg: 'Empty subject!'});
			return;
		}

		if (!content.trim().length) {
			eventBus.emitEvent('messages:compose-validate', {msg: 'Empty content!'});
			return;
		}

		jsonize(fetchPost('/api/messages/send', {message: {to, subject, content}})).then(response => {
			if (response.status === 'ok') {
				eventBus.emitEvent('messages:compose-validate', '');
				eventBus.emitEvent('messages:compose-send');
				this.loadSent();
				return;
			}

			switch (response.error.code) {
			case Errors.NotAuthorized.code:
				eventBus.emitEvent('application:sign-out');
				break;
			case Errors.InvalidEmail.code:
			case Errors.EmptySubject.code:
			case Errors.EmptyContent.code:
			case Errors.ContentTooLarge.code:
				eventBus.emitEvent('messages:compose-validate', response.error.msg);
				break;
			default:
				console.error('Unknown response:', response);
			}
		}).catch(consoleError);
	};

	//TODO: change storage
	onStatusButtonClicked = (status, folder, ids) => {
		jsonize(fetchPost(`/api/messages/${status}`, {messages: ids})).then(response => {
			if (response.status === 'ok') {
				storage.get('userInfo').getMessages().get('folder').forEach(message => {
					if (ids.includes(message.id)) {
						message.read = status === 'read';
					}
				});
				// eventBus.emitEvent(`messages:${folder}-${status}`, ids);
				console.log(`${status} successful`);
				return;
			}

			if (response.error.code === Errors.NotAuthorized.code) {
				eventBus.emitEvent('application:sign-out');
				return;
			}

			consoleError('Unknown response:', response);
		}).catch(consoleError);
	};

	getMessage = id => {
		console.log('HERE', id);
		jsonize(fetchGetWithParams('/api/messages/get', {id})).then(response => {
			if (response.status === 'ok') {
				this.transformDate(response.message, new Date());
				eventBus.emitEvent('messages:render-message', response.message);
				return;
			}

			if (response.error.code === Errors.NotAuthorized.code) {
				eventBus.emitEvent('application:sign-out');
				return;
			}

			consoleError('Unknown response:', response);
		}).catch(consoleError);
	};

	toggleMessageState = (status, {folder, ids}) => {
		jsonize(fetchPost(`/api/messages/${status}`, {messages: ids})).then(response => {
			if (response.status === 'ok') {
				console.log(storage.get('userInfo').getMessages(), folder);
				storage.get('userInfo').getMessages().get(folder).forEach(message => {
					if (ids.includes(message.id)) {
						message.read = status === 'read';
					}
				});
				// eventBus.emitEvent(`messages:${folder}-${status}`, ids);
				eventBus.emitEvent('render:update');
				console.log(`${status} successful`);
				return;
			}

			if (response.error.code === Errors.NotAuthorized.code) {
				eventBus.emitEvent('application:sign-out');
				return;
			}

			consoleError('Unknown response:', response);
		}).catch(consoleError);
	};

	deleteMessage = ({folder, ids}) => {
		let localUserInfo = storage.get('userInfo');
		for (let id of ids) {
			localUserInfo.deleteMessage(folder, id);
		}
		storage.set('userInfo', localUserInfo);
		this.toggleMessageState('remove', {folder, ids});
	};

	moveMessage = ({from, to, list}) => {
		for (let id of list) {
			jsonize(fetchPost(`/api/messages/changeFolder/${id}/${to}`, {})).then(response => {
				if (response.status === 'ok') {
					let localUserInfo = storage.get('userInfo');
					localUserInfo.moveMessage(from, to, id);
					storage.set('userInfo', localUserInfo);
					// eventBus.emitEvent(`messages:${folder}-${status}`, ids);
					eventBus.emitEvent('render:update');
					console.log(`${status} successful`);
					return;
				}

				if (response.error.code === Errors.NotAuthorized.code) {
					eventBus.emitEvent('application:sign-out');
					return;
				}

				consoleError('Unknown response:', response);
			}).catch(consoleError);

		}
	}

	updateFolderMessages = (folder, page, perPage) => {
		return jsonize(fetchGetWithParams('/api/messages/getByPage', {perPage, page, folder})).then(response => {
			if (response.status === 'ok') {
				let userInfo = storage.get('userInfo');
				if (!response.messages || response.messages.length===0) {
					console.log("Break")
					return;
				}
				response.messages.forEach(message => this.transformDate(message, new Date()));
				if (page===1) {
					userInfo.getMessages().delete(folder);
				}
				userInfo.addMessageList(folder, response.messages);
				storage.set('userInfo', userInfo);
				eventBus.emitEvent(`folder.onload/${folder}`);
				return;
			}
			console.error(response);
		}).catch(consoleError);
	};

	loadMessagesById = ({messages, folder}) => {
		jsonize(fetchPost(`/api/messages/getById`, {ids: messages})).then(response => {
			if (response.status === 'ok') {
				if (!response.messages){
					console.log('Empty getMessages response');
					return;
				}
				response.messages.forEach(message => this.transformDate(message, new Date()));
				let userInfo = storage.get('userInfo');
				userInfo.getMessages().delete(folder);
				userInfo.addMessageList(folder, response.messages);
				// eventBus.emitEvent('prerender:/messages/search', {});
				eventBus.emitEvent(`render:/messages/${folder}`);
				return;
			}

			switch (response.error.code) {
			case Errors.NotAuthorized.code:
				eventBus.emitEvent('application:sign-out');
				break;
			case Errors.InvalidEmail.code:
			case Errors.EmptySubject.code:
			case Errors.EmptyContent.code:
			case Errors.ContentTooLarge.code:
				eventBus.emitEvent('messages:compose-validate', response.error.msg);
				break;
			default:
				console.error('Unknown response:', response);
			}
		}).catch(consoleError);
	}
}
