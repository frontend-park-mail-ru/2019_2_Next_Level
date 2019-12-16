import './select.tmpl.js';
export default class Select {

	constructor() {

	}

	render = (onMove) => {
		let selectBlock = document.getElementsByClassName('select')[0];
		// debugger;
		let list = selectBlock.getElementsByClassName('select__list')[0];
		selectBlock.addEventListener('click', event => {
			event.stopPropagation();
			event.preventDefault();
			list.classList.toggle('select__list_visible');
			selectBlock.getElementsByClassName('select__header')[0].classList.toggle('select_active');
			// list.setAttribute('class', 'select__list_visible');
		});
		for (let item of list.getElementsByClassName('select__list__item')) {
			item.addEventListener('click', event => {
				event.stopPropagation();
				const folderName = item.className.match(/item_(\w+)/)[1];
				onMove(folderName);
			});
		}
		// selectBlock.getElementsByClassName(se)
		// let selectBlock = document.getElementsByClassName('select');
		// console.log(select);
		//
		// let select = selectBlock[0].getElementsByTagName('select')[0];
		// let a = document.createElement('div');
		// a.setAttribute('class', 'select__select_selected');
		// a.innerHTML = select.options[select.selectedIndex].innerHTML;
		// selectBlock.appendChild(a);

	}
}