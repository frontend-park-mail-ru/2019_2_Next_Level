import './form.tmpl.js';

export default class Form {
	constructor(element, args) {
		this.element = element;
		this.args = args;
	}

	render = renderer => {
		renderer(this.element, window.fest['components/common/form/form.tmpl'](this.args));
	};

	static displayMessage(inputName, message) {
		// console.log('displayMessage', inputName, message);
		document.querySelector(`.form__message_${inputName}`).innerText = message;
	}
}
