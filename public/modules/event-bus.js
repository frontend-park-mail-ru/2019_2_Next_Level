class EventBus {
	/**
	 * @constructor
	 */
	constructor() {
		this.listeners = {};
	}

	/**
	 * @callback EventBusCallback
	 * @param {*} data
	 */

	/**
	 * Subscribes event listener
	 * @param   {string} event
	 * @param   {EventBusCallback} callback
	 * @returns {EventBus}
	 */
	addEventListener = (event, callback) => {
		if (this.listeners[event] && this.listeners[event].indexOf(callback) != -1) {
			console.log(`Dublicate event: ${event}`);
			return;
		}
		(this.listeners[event] || (this.listeners[event] = [])).push(callback);
		// console.log('Add event listener: ', event, callback);
		return this;
	};

	removeEvent = (name) => {
		this.listeners[name] = [];
	};

	Clear = () => {
		this.listeners = [];
	};

	/**
	 * Unsubscribes event listener
	 * @param   {string} event
	 * @param   {EventBusCallback} callback
	 * @returns {EventBus}
	 */
	removeEventListener = (event, callback) => {
		this.listeners[event] = (this.listeners[event] || []).filter(c => c !== callback);
		return this;
	};

	/**
	 * Dispatches event
	 * @param   {string} event
	 * @param   {*} data
	 * @returns {EventBus}
	 */
	emitEvent = (event, data={}) => {
		console.log('emit', event, data);
		(this.listeners[event] || (this.listeners[event] = [])).forEach(callback => callback(data));
		return this;
	};
}

export default new EventBus();
