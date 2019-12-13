import MessagesModel from './messages-model.js';
import MessagesView from './messages-view.js';
import eventBus from 'public/modules/event-bus';
import {MessagesPages} from './routes';

export default class MessagesController {
	/**
	 * @constructor
	 */
	constructor() {
		console.log('Messages-controller create');
		this.messagesModel = new MessagesModel();
		this.messagesView = new MessagesView(this.messagesModel);
		eventBus.addEventListener('settings:folders-changed', (folders) => {
			console.log(MessagesPages);
			const temp = MessagesPages.slice(0, 3);
			MessagesPages.length=0;
			MessagesPages.push(...temp);
			folders.forEach(folder => {
				MessagesPages.push(`/messages/${folder.name}`);
			});
			eventBus.emitEvent('router:reload');
			console.log(MessagesPages);
		});
	}
}
