export class UserInfo {
	constructor(src) {
		if (!src) {
			return this;
		}
		this.folders = src.folders;
		// this.messages = src.messages;
		this.avatar = src.avatar;
		this.birthDate = src.birthDate;
		this.firstName = src.firstName;
		this.login = src.login;
		this.nickName = src.nickName;
		this.secondName = src.secondName;
		this.sex = src.sex;
		this.messages = new Map();
	}

	setFolders = (folders) => {
		this.folders = folders;
	};

	setMessages = (messages) => {
		this.messages = messages;
	};

	getFolders = () => {
		if (!this.folders){
			return [];
		}
		return this.folders;
	};

	getMessages = () => {
		if (!this.messages) {
			return new Map();
		}
		return this.messages;
	};

	addMessage = (folderName, message) => {
		if (!this.messages) {
			this.messages = new Map();
		}
		if (!this.messages.has(folderName)){
			this.messages.set(folderName, []);
		}
		this.messages.get(folderName).push(message);
	};

	addMessageList = (folderName, messages) => {
		messages.forEach(message => this.addMessage(folderName, message));
	}

	addFolder = (folder) => {
		// return this.folders.find(elem => elem.name===name);
		this.folders.push(folder);
	};

	deleteFolderByName = (name) => {
		const index = this.folders.findIndex(elem => elem.name===name);
		if (index !== -1) {
			this.folders.splice(index, 1);
		}
	}

	deleteMessage = (folder, id) => {
		this.messages.set(folder, this.messages.get(folder).filter(elem => elem.id !== id));
	}

	moveMessage = (from, to, id) => {
		const msg = this.messages.get(from).find(elem => elem.id===id);
		this.deleteMessage(from, id);
		this.addMessage(to, msg);
	}

}