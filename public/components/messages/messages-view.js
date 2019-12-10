import {MessagesRenderState} from './messages-utility.js';
import {renderFest} from '../../modules/view-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import router from '../../modules/router.js';
import routes from '../../modules/routes.js';

import './messages.css';
import './compose/compose.tmpl.js';
import './datalist/datalist.tmpl.js';
import './datalist/-item/datalist-item.tmpl.js';
import './message/message.tmpl.js';
import storage from '../../modules/storage';

export default class MessagesView {
	/**
	 * @constructor
	 * @param {MessagesModel} messagesModel
	 */
	constructor(messagesModel) {
		console.log('Messages-view create');
		this.messagesModel = messagesModel;

		routes.GetModuleRoutes('auth', 'settings').forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.messagesModel.dropRenderState);
		});

		eventBus.addEventListener('render:/messages/compose', this.prerenderCompose);
		eventBus.addEventListener('render:/messages/message', this.prerenderMessage);

		const userInfo = storage.get('userInfo');
		if (userInfo) {
			for (let folder of userInfo.getFolders()) {
				eventBus.addEventListener(`render:/messages/${folder.name}`, partial(this.renderFolder, folder.name));
			}
		}

		eventBus.addEventListener('rerender:/messages/compose', this.renderCompose);
		eventBus.addEventListener('messages:compose-validate', this.composeMessage);

		eventBus.addEventListener('messages:compose-send', this.onComposeSend);

		eventBus.addEventListener('messages:inbox-loaded', this.prerenderInboxOnLoaded);
		eventBus.addEventListener('messages:sent-loaded', this.prerederSentOnLoaded);

		eventBus.addEventListener('messages:render-message', this.renderMessage);
	}

	prerender = (renderer, toRenderState) => {
		// if (this.messagesModel.renderState !== toRenderState) {
			renderer();
			console.log('Render: messages');
			this.messagesModel.renderState = toRenderState;
		// }
	};

	prerenderOnLoaded = (renderer, toRenderState) => {
		if (this.messagesModel.renderState === toRenderState) {
			renderer();
		}
	};

	prerenderMessage = ({pathname, search}) => {
		this.messagesModel.getMessage(search.id);
	};

	renderMessage = message => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_messages-wrap',
			'components/messages/message/message.tmpl',
			message,
		);
	};


	renderCompose = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_messages-wrap',
			'components/messages/compose/compose.tmpl',
		);

		const form = document.querySelector('.messages');
		form.addEventListener('submit', event => {
			event.preventDefault();

			const to = form.elements.to.value;
			const subject = form.elements.subject.value;
			const content = form.elements.content.value;

			eventBus.emitEvent('messages:compose-send-button-clicked', {to, subject, content});
		});

		document.querySelector('.actions__button_cancel').addEventListener('click', event => {
			event.preventDefault();

			if (confirm('The body of your email will be lost.')) {
				eventBus.emitEvent('render:/messages/inbox');
			}
		});
	};

	composeMessage = msg => {
		document.querySelector('.compose-message').innerText = msg;
	};

	onComposeSend = () => {
		alert('Message sent!');
		router.routeNew({}, '', '/messages/sent');
	};

	checkAll = (checkboxes, checked) => {
		checkboxes.forEach(checkbox => checkbox.checked = checked);
	};

	anyChecked = checkboxes => {
		for (let checkbox of checkboxes) {
			if (checkbox.checked) {
				return true;
			}
		}
		return false;
	};

	markMessageAsRead = id => {
		const datalistItem = document.querySelector(`.datalist-item_id${id}`);
		datalistItem.classList.remove('datalist-item_unread');
		datalistItem.classList.add('datalist-item_read');
	};

	markMessageAsUnread = id => {
		const datalistItem = document.querySelector(`.datalist-item_id${id}`);
		datalistItem.classList.remove('datalist-item_read');
		datalistItem.classList.add('datalist-item_unread');
	};

	messageIsRead = id => {
		const datalistItem = document.querySelector(`.datalist-item_id${id}`);
		return datalistItem.classList.contains('datalist-item_read');
	};

	setMessageStatus = (status, id) => {
		if (status === 'read') {
			this.markMessageAsRead(id);
		} else {
			this.markMessageAsUnread(id);
		}
	};

	toggleMessageReadStatus = id => {
		console.log('id', id);
		const datalistItem = document.querySelector(`.datalist-item_id${id}`);
		datalistItem.classList.toggle('datalist-item_read');
		datalistItem.classList.toggle('datalist-item_unread');
	};

	renderFolder = (folderName) => {
		console.log('Render folder: ', folderName);
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_messages-wrap',
			'components/messages/datalist/datalist.tmpl',
			{page: folderName, messages: storage.get('userInfo').getMessages().get(folderName) || []},
		);

		const checkboxes = [...document.querySelectorAll('.datalist-item__checkbox')];

		const selectAll = document.querySelector('.actions__button_select input');
		selectAll.addEventListener('click', event => {
			event.stopPropagation();	// останавливаем всплытие события
			this.checkAll(checkboxes, selectAll.checked);
		});

		document.querySelector('.actions__button_select').addEventListener('click', event => {
			event.preventDefault();
			selectAll.checked = !selectAll.checked;
			this.checkAll(checkboxes, selectAll.checked);
		});

		this.messagesUncheckedCount = checkboxes.length
		checkboxes.forEach(checkbox => checkbox.addEventListener('click', event => {
			this.messagesUncheckedCount += checkbox.checked ? -1 : 1;
			selectAll.checked = this.messagesUncheckedCount===0
		}));

		document.querySelectorAll('.datalist-item__status').forEach(toggler => toggler.addEventListener('click', event => {
			event.preventDefault();
			const id = +toggler.className.match(/id(\d+)/)[1];
			let targetState = 'read';
			if (this.messageIsRead(id)){
				targetState = 'unread';
			}
			eventBus.emitEvent(`messages:${folderName}-${targetState}-button-clicked`, [id]);
			this.toggleMessageReadStatus(id);
		}));

		const statusCallback = (status, event) => {
			event.preventDefault();
			let ids = [];
			checkboxes.filter(checkbox => checkbox.checked).forEach(checkbox => {
				ids.push(+checkbox.className.match(/id(\d+)/)[1]);
			});
			eventBus.emitEvent(`messages:${folderName}-${status}-button-clicked`, ids);
			ids.forEach(id => this.setMessageStatus(status, id));
		};

		document.querySelector('.actions__button_read').addEventListener('click', partial(statusCallback, 'read'));
		document.querySelector('.actions__button_unread').addEventListener('click', partial(statusCallback, 'unread'));
	};

	renderInbox = partial(this.renderFolder, 'inbox');
	renderSent = partial(this.renderFolder, 'sent');

	prerenderCompose = partial(this.prerender, this.renderCompose, MessagesRenderState.RenderedCompose);
	prerenderInbox = partial(this.prerender, this.renderInbox, MessagesRenderState.RenderedInbox);
	prerenderSent = partial(this.prerender, this.renderSent, MessagesRenderState.RenderedSent);

	prerenderInboxOnLoaded = partial(this.prerenderOnLoaded, this.renderInbox, MessagesRenderState.RenderedInbox);
	prerederSentOnLoaded = partial(this.prerenderOnLoaded, this.renderSent, MessagesRenderState.RenderedSent);
}
