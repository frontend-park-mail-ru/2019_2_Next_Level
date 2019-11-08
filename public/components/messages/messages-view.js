import {MessagesRenderState} from './messages-utility.js';
import {addStyleSheet,addStyleSheetUnsafe, renderFest} from '../../modules/view-utility.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';

import './compose/compose.tmpl.js';

export default class MessagesView {
	/**
	 * @constructor
	 * @param {MessagesModel} messagesModel
	 */
	constructor(messagesModel) {
		this.messagesModel = messagesModel;

		addStyleSheet('/components/common/form/form.css');
		addStyleSheetUnsafe('/components/messages/messages.css');

		[
			'/auth/sign-in',
			'/auth/sign-up',
			'/settings/user-info',
			'/settings/security',
		].forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.messagesModel.dropRenderState);
		});

		[
			{
				page: 'compose',
				renderer: this.renderCompose,
				toRenderState: MessagesRenderState.RenderedCompose,
			}, {
				page: 'inbox',
				renderer: this.renderInbox,
				toRenderState: MessagesRenderState.RenderedInbox,
			}, {
				page: 'sent',
				renderer: this.renderSent,
				toRenderState: MessagesRenderState.RenderedSent,
			},
		].forEach(({page, renderer, toRenderState}) => {
			eventBus.addEventListener(`render:/messages/${page}`, partial(this.prerender, renderer, toRenderState));
		});

		eventBus.addEventListener('rerender:/messages/compose', this.renderCompose);
		eventBus.addEventListener('messages:compose-validate', this.composeMessage);

		eventBus.addEventListener('messages:compose-send', this.onComposeSend);
	}

	prerender = (renderer, toRenderState) => {
		if (this.messagesModel.renderState !== toRenderState) {
			renderer();
			this.messagesModel.renderState = toRenderState;
		}
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
		eventBus.emitEvent('rerender:/messages/compose');
		// eventBus.emitEvent('render:/messages/inbox');
	};

	renderInbox = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_messages-wrap',
			'components/messages/inbox/inbox.tmpl',
		);
	};

	renderSent = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__right_messages-wrap',
			'components/messages/sent/sent.tmpl',
		);
	};
}
