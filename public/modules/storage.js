class Storage {
	constructor() {
		this.storage = new Map();
	}

	set = (name, data) => {
		this.storage[name] = data;
	};

	get = (name) => {
		return this.storage[name];
	}
}

export default new Storage();