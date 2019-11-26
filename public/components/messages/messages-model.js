import {MessagesRenderState} from './messages-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {jsonize, fetchGetWithParams, fetchPost, consoleError} from '../../modules/fetch.js';
import {partial} from '../../modules/partial.js';
import {checkEmail} from '../../modules/validate.es6.inc.js';

export default class MessagesModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.onNotAuthorized();

		eventBus.addEventListener('application:authorized', this.onAuthorized);
		eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);

		eventBus.addEventListener('messages:compose-send-button-clicked', this.onComposeSendButtonClicked);
		eventBus.addEventListener('messages:inbox-read-button-clicked', this.onInboxReadButtonClicked);
		eventBus.addEventListener('messages:inbox-unread-button-clicked', this.onInboxUnReadButtonClicked);
		eventBus.addEventListener('messages:sent-read-button-clicked', this.onSentReadButtonClicked);
		eventBus.addEventListener('messages:sent-unread-button-clicked', this.onSentUnReadButtonClicked);
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

	loadFolder = folder => {
		jsonize(fetchGetWithParams('/api/messages/getByPage', {perPage: 25, page: 1, folder})).then(response => {
			if (response.status === 'ok') {
				this.folders[folder].messages = response.messages;
				const now = new Date();
				this.folders[folder].messages.forEach(message => this.transformDate(message, now));
				eventBus.emitEvent(`messages:${folder}-loaded`);
				return;
			}
			console.error(response);
		}).catch(consoleError);
	};

	loadInbox = partial(this.loadFolder, 'inbox');
	loadSent = partial(this.loadFolder, 'sent');

	onAuthorized = userInfo => {
		this.userInfo = userInfo;

		this.loadInbox();
		this.loadSent();
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

	onInbox = inbox => {
		this.folders.inbox = inbox;
	};

	onSent = sent => {
		this.folders.sent = sent;
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

	onStatusButtonClicked = (status, folder, ids) => {
		jsonize(fetchPost(`/api/messages/${status}`, {messages: ids})).then(response => {
			if (response.status === 'ok') {
				this.folders[folder].messages.forEach(message => {
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

	onInboxReadButtonClicked = partial(this.onStatusButtonClicked, 'read', 'inbox');
	onInboxUnReadButtonClicked = partial(this.onStatusButtonClicked, 'unread', 'inbox');
	onSentReadButtonClicked = partial(this.onStatusButtonClicked, 'read', 'sent');
	onSentUnReadButtonClicked = partial(this.onStatusButtonClicked, 'unread', 'sent');

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
}
