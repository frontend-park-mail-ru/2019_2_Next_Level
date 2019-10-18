export const renderReplace = (element, html) => {
	element.innerHTML = html;
};

export const renderAppend = (element, html) => {
	element.innerHTML += html;
};

export const addStyleSheet = href => {
	if (!document.querySelector(`head link[href="${href}"]`)) {
		const link = document.createElement('link');
		link.setAttribute('rel', 'stylesheet');
		link.setAttribute('href', href);
		document.getElementsByTagName('head')[0].appendChild(link);
	}
};
