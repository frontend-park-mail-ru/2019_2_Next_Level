/**
 * @param {HTMLElement} element
 * @param {string} html
 */
export const renderReplace = (element, html) => {
	element.innerHTML = html;
};

export const renderAppend = (element, html) => {
	element.innerHTML += html;
};

export const rerender = (element, html) => {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	const newElement = template.content.firstChild;
	element.parentNode.replaceChild(newElement, element);
};

export const renderInsertAfterBegin = (element, html) => {
	element.insertAdjacentElement('afterBegin', html);
};

export const addStyleSheetUnsafe = href => {
	const link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('href', href);
	document.getElementsByTagName('head')[0].appendChild(link);
};

export const addStyleSheet = href => {
	if (!document.querySelector(`head link[href="${href}"]`)) {
		addStyleSheetUnsafe(href);
	}
};

