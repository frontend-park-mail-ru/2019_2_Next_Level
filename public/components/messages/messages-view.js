import {MessagesRenderState} from './messages-utility.js';
import Select from 'common/select/select.js';
import {renderFest} from 'view-utility.js';
import eventBus from 'event-bus.js';
import {partial} from 'partial.js';
import {ReplaceInnerRenderer} from 'renderer.js';
import router from 'router.js';
import routes from 'routes.js';
import {Config} from 'config.js';


import './messages.css';
import './compose/compose.tmpl.js';
import './datalist/datalist.tmpl.js';
import './datalist/-item/datalist-item.tmpl.js';
import './message/message.tmpl.js';
import storage from 'storage';

export default class MessagesView {
	/**
	 * @constructor
	 * @param {MessagesModel} messagesModel
	 */
	constructor(messagesModel) {
		console.log('Messages-view create');
		this.messagesModel = messagesModel;
		this.currentFolder = 'inbox';
		this.requestedPage = 1;
		this.pagesLoadPlan = new Map();
		this.loadPagesMutex = new Map();

		routes.GetModuleRoutes('auth', 'settings').forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.messagesModel.dropRenderState);
		});

		eventBus.addEventListener('render:/messages/compose', this.prerenderCompose);
		eventBus.addEventListener('render:/messages/message', this.prerenderMessage);

		const userInfo = storage.get('userInfo');
		if (userInfo) {
			let folders = userInfo.getFolders();
			folders.push({name: 'search'});
			for (let folder of folders) {
				console.log(folder);
				eventBus.addEventListener(`render:/messages/${folder.name}`, partial(this.renderFolder, folder.name));
			}
		}
		// eventBus.addEventListener('render:/messages/search', partial(this.renderFolder, 'search'));

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
		console.log('renderFolder ', folderName);
		this.currentFolder = folderName;
		// сколько сейчас есть страниц в хранилище
		console.log((storage.get('userInfo').getMessages().get(folderName) || []).length);
		const messagesCount = (storage.get('userInfo').getMessages().get(folderName) || []).length;
		let pagesCount = Math.trunc(messagesCount/Config.messagesPerPage)+(messagesCount%Config.messagesPerPage>0);

		this.loadPagesMutex.set(folderName, pagesCount);
		this.requestedPage = pagesCount;
		console.log('Render folder: ', folderName);
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_messages-wrap',
			'components/messages/datalist/datalist.tmpl',
			{page: folderName,
						messages: storage.get('userInfo').getMessages().get(folderName) || [],
						folders: storage.get('userInfo').getFolders(),
						},
		);

		document.getElementsByClassName('main')[0].addEventListener('scroll', event => {
			event.preventDefault();
			let element = event.target;
			const scroll = element.scrollTop+1;
			const height = element.scrollHeight - element.clientHeight;
			if ( height - scroll <= 0 ) {
				console.log("Ping ", this.requestedPage, this.loadPagesMutex.get(this.currentFolder));
				this.requestedPage++;
				// если запросили следущую страницу, то идем и получаем
				if (this.requestedPage-this.loadPagesMutex.get(this.currentFolder)<=1) {
					console.log('Requst page: ', this.requestedPage);
					eventBus.emitEvent('messages:loadnewpage', {page: this.requestedPage, folder: this.currentFolder});
				} else {
					// если запрос уже был, но страница еще не перерисована, откатываем счетчик
					this.requestedPage--;
				}
			}
			console.log(height, scroll)

		});

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

		this.messagesUncheckedCount = checkboxes.length;
		checkboxes.forEach(checkbox => checkbox.addEventListener('click', event => {
			this.messagesUncheckedCount += checkbox.checked ? -1 : 1;
			selectAll.checked = this.messagesUncheckedCount===0;
		}));

		document.querySelectorAll('.datalist-item__status').forEach(toggler => toggler.addEventListener('click', event => {
			event.preventDefault();
			const id = +toggler.className.match(/id(\d+)/)[1];
			let targetState = 'read';
			if (this.messageIsRead(id)){
				targetState = 'unread';
			}
			eventBus.emitEvent(`messages:${targetState}-button-clicked`, {folder: folderName, ids: [id]});
			this.toggleMessageReadStatus(id);
		}));

		const statusCallback = (status, event) => {
			event.preventDefault();
			let ids = [];
			checkboxes.filter(checkbox => checkbox.checked).forEach(checkbox => {
				ids.push(+checkbox.className.match(/id(\d+)/)[1]);
			});
			eventBus.emitEvent(`messages:${status}-button-clicked`, {folder: folderName, ids});
		};


		let select = new Select();
		select.render(newFolderName => {
			let ids = this.getSelected(checkboxes, data => +data);
			eventBus.emitEvent('messages:move_messages', {from: folderName, to: newFolderName, list: ids});
		});

		document.querySelector('.actions__button_read').addEventListener('click', partial(statusCallback, 'read'));
		document.querySelector('.actions__button_unread').addEventListener('click', partial(statusCallback, 'unread'));
		document.querySelector('.actions__button_delete').addEventListener('click', partial(statusCallback, 'delete'));
	};

	getSelected = (checkboxes, converter) => {
		let ids = [];
		checkboxes.filter(checkbox => checkbox.checked).forEach(checkbox => {
			ids.push(converter(checkbox.className.match(/id(\d+)/)[1]));
		});
		return ids;
	}


	renderInbox = partial(this.renderFolder, 'inbox');
	renderSent = partial(this.renderFolder, 'sent');

	prerenderCompose = partial(this.prerender, this.renderCompose, MessagesRenderState.RenderedCompose);
	prerenderInbox = partial(this.prerender, this.renderInbox, MessagesRenderState.RenderedInbox);
	prerenderSent = partial(this.prerender, this.renderSent, MessagesRenderState.RenderedSent);

	prerenderInboxOnLoaded = partial(this.prerenderOnLoaded, this.renderInbox, MessagesRenderState.RenderedInbox);
	prerederSentOnLoaded = partial(this.prerenderOnLoaded, this.renderSent, MessagesRenderState.RenderedSent);
}
