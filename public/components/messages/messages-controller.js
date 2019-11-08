import MessagesModel from './messages-model.js';
import MessagesView from './messages-view.js';

export default class MessagesController {
	/**
	 * @constructor
	 */
	constructor() {
		this.messagesModel = new MessagesModel();
		this.messagesView = new MessagesView(this.messagesModel);
	}
}
