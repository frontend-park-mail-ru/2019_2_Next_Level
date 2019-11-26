import eventBus from './event-bus.js';
import Form from '../components/common/form/form.js';

/**
 * Adds event listener to element that emits event to event bus
 * @param {string} selector
 * @param {string} type
 * @param {string} event
 * @param {Object} data
 */
export const eventBusEmitter = (selector, type, event, data={}) => {
	document.querySelector(selector).addEventListener(type, e => {
		e.preventDefault();
		eventBus.emitEvent(event, data);
	});
};

/**
 * Renders fest template on element
 * @param {Renderer} renderer
 * @param {string} selector
 * @param {string} templatePath
 * @param {Object} templateData
 */
export const renderFest = (renderer, selector, templatePath, templateData={}) => {
	renderer.render(document.querySelector(selector), window.fest[templatePath](templateData));
};


/**
 *
 * @param {Renderer} renderer
 * @param {string} selector
 * @param {function} template
 * @param {Object} templateData
 */
export const renderFestTemplate = (renderer, selector, template, templateData={}) => {
	renderer.render(document.querySelector(selector), template(templateData));
};

/**
 * Adds style sheet to html without duplication check
 * @param {string} href
 */
export const addStyleSheetUnsafe = href => {
	const link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('href', href);
	document.getElementsByTagName('head')[0].appendChild(link);
};

/**
 * Adds style sheet to html with duplication check
 * @param {string} href
 */
export const addStyleSheet = href => {
	if (!document.querySelector(`head link[href="${href}"]`)) {
		addStyleSheetUnsafe(href);
	}
};

/**
 * Displays selected form__message (and clears others)
 * @param {[string]} inputs
 * @param {string} inputName
 * @param {string} message
 */
export const abstractDisplayMessage = (inputs, {inputName, message}) => {
	console.log('abstractDisplayMessage', inputs, inputName, message);
	inputs.forEach(input => {
		Form.displayMessage(input, '');
	});

	Form.displayMessage(inputName, message);
};
