export class Folder {
	constructor(name, count, isSystem) {
		this.name = name || '';
		this.capacity = count || 0;
		this.isSystem = isSystem || false;
	}

	getName() {
		return this.name;
	}

	getCount() {
		return this.capacity;
	}

	getIsSystem() {
		return this.isSystem;
	}

	static constructArray(folders, adapter) {
		let list = [];
		for (const folder of folders) {
			list.push(adapter(folder));
		}
		return list
	}

}