import {MessagesRenderState} from './messages-utility.js';
import {Errors} from '../../modules/errors.es6.inc.js';
import eventBus from '../../modules/event-bus.js';
import {checkEmail} from '../../modules/validate.es6.inc.js';
import {jsonize, fetchPost, consoleError} from '../../modules/fetch.js';

export default class MessagesModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.dropRenderState();

		eventBus.addEventListener('application:authorized', this.onAuthorized);
		eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);
		eventBus.addEventListener('application:inbox', this.onInbox);
		eventBus.addEventListener('application:sent', this.onSent);

		eventBus.addEventListener('messages:compose-send-button-clicked', this.onComposeSendButtonClicked);

		this.inbox = {
			// pagesCount: 1,
			// page: 1,
			messages: [
				{
					read: false,
					addr: 'Google',
					subject: 'Subject',
					content: 'Content content content Content content content Content content content Content content content...',
					date: '13:05',
				}, {
					read: false,
					addr: 'Google',
					subject: 'Subject a bit longer',
					content: 'Content content content Content content content Content content content Content content content...',
					date: 'Nov 7',
				}, {
					read: false,
					addr: 'Instagram',
					subject: 'Subject hmmmmmmmmmmmmm',
					content: 'Sooooooo oconton asldk falksdjfla jsdl jalskdjf laksjdfl kajsdlkf jasldkj',
					date: 'Dec 28',
				}, {
					read: false,
					addr: 'long long long long long long long',
					subject: 'Today i willl hmm hmmm hmmmmmmm hmmmmmmmm hmmmmmmm htmmmm',
					content: 'COnntetnn',
					date: '10/10/2010',
				},
			],
		};
		this.sent = {
			// pagesCount: 1,
			// page: 1,
			messages: [],
		};
	}

	dropRenderState = () => {
		this.renderState = MessagesRenderState.NotRendered;
	};

	onAuthorized = userInfo => {
		this.userInfo = userInfo;
	};

	onNotAuthorized = () => {
		this.dropRenderState();

		this.userInfo = {};
	};

	onInbox = inbox => {
		this.inbox = inbox;
	};

	onSent = sent => {
		this.sent = sent;
	};

	onComposeSendButtonClicked = ({to, subject, content}) => {
		to = to.trim().split(/,\s*/);
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
}
