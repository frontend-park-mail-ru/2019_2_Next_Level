import {HeaderRenderState} from './header-utility.js';
import eventBus from 'public/modules/event-bus.js';
import {consoleError, fetchPost, jsonize, fetchGet} from 'public/modules/fetch';
import {Errors} from 'public/modules/errors.es6.inc';
import storage from 'public/modules/storage';

export default class HeaderModel {
	/**
	 * @constructor
	 */
	constructor() {
		this.renderState = HeaderRenderState.NotRendered;

		eventBus.addEventListener('application:authorized', this.onAuthorized);
		eventBus.addEventListener('application:not-authorized', this.onNotAuthorized);
		eventBus.addEventListener('header:search', this.onSearch);
		// eventBus.addEventListener('header:getMessages', this.loadMessages);
	}

	onAuthorized = userInfo => {
		this.userInfo = {
			authorized: true,
			nickName: userInfo.nickName,
			avatar: userInfo.avatar,
		};
	};

	onNotAuthorized = () => {
		this.userInfo = {
			authorized: false,
		};
	};

	onSearch = ({query}) => {
		jsonize(fetchGet(`/api/messages/search/${query}`)).then(response => {
			if (response.status === 'ok') {
				if (!response.messages){
					console.log('Empty search response');
					return;
				}
				eventBus.emitEvent('application:getMessagesById', {folder: 'search', messages: response.messages});
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

	loadMessages = ({messages}) => {
		debugger;
		jsonize(fetchPost(`/api/messages/getById`, {ids: messages})).then(response => {
			if (response.status === 'ok') {
				if (!response.messages || response.messages.length===0){
					console.log('Empty getMessages response');
					return;
				}
				let userInfo = storage.get('userInfo');
				userInfo.getMessages().delete('search');
				userInfo.addMessageList('search', response.messages);
				eventBus.emitEvent('prerender:/messages/search', {});
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
