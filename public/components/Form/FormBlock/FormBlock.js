export const formMessage = (name, msg) => {
	document.querySelector(`.form__field[name="${name}"] ~ .form__message`).innerHTML = msg;
};
