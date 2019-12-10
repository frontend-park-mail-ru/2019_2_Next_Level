class EventBus {
	/**
	 * @constructor
	 */
	constructor() {
		this.listeners = {};
		this.sporadic = {};
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
	addEventListener = (event, callback, priority=0) => {
		(this.listeners[event] || (this.listeners[event] = [])).push({callback, priority, lifetime: undefined});
		this.listeners[event].sort((a,b) => {
			return b.priority - a.priority; // по убыванию
		});
		return this;
	};

	addSporadicEventListener = (event, callback, lifetime=1, priority=0) => {
		(this.listeners[event] || (this.listeners[event] = [])).push({callback, priority, lifetime});
		this.listeners[event].sort((a,b) => {
			return b.priority - a.priority; // по убыванию
		});
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
		this.listeners[event] = (this.listeners[event] || []).filter(c => c.callback !== callback);
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
		if (!this.listeners[event]) {
			return this;
		}
		this.listeners[event].forEach(elem => elem.callback(data));
		if (this.listeners[event].lifetime) {
			this.listeners[event].lifetime--;
			if (this.listeners[event].lifetime===0) {
				console.log('Remove event ', event);
				this.listeners[event] = undefined;
			}
		}
		return this;
	};
}

export default new EventBus();
