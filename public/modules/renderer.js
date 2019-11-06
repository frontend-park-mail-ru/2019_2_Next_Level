class Renderer {
	/**
	 * Renders
	 * @param {HTMLElement} element
	 * @param {DOMString} html
	 */
	static render = (element, html) => {};
}

export class ReplaceInnerRenderer extends Renderer {
	/**
	 * Replaces innerHTML in element
	 * @param {HTMLElement} element
	 * @param {DOMString} html
	 */
	static render = (element, html) => {
		element.innerHTML = html;
	};
}

export class DummyAppendRenderer extends Renderer {
	/**
	 * Appends html in element
	 * @param {HTMLElement} element
	 * @param {DOMString} html
	 */
	static render = (element, html) => {
		element.innerHTML += html;
	};
}

export class InsertAfterBeginRenderer extends Renderer {
	/**
	 * Inserts html after begin of the element
	 * @param {HTMLElement} element
	 * @param {DOMString} html
	 */
	static render = (element, html) => {
		element.insertAdjacentHTML('afterBegin', html);
	};
}

export class InsertBeforeEndRenderer extends Renderer {
	/**
	 * Inserts html after begin of the element
	 * @param {HTMLElement} element
	 * @param {DOMString} html
	 */
	static render = (element, html) => {
		element.insertAdjacentHTML('beforeEnd', html);
	};
}

export class InplaceRenderer extends Renderer {
	/**
	 * Rerenders element inplace
	 * @param {HTMLElement} element
	 * @param {DOMString} html
	 */
	static render = (element, html) => {
		const template = document.createElement('template');
		template.innerHTML = html.trim();
		const newElement = template.content.firstChild;
		element.parentNode.replaceChild(newElement, element);
	};
}
