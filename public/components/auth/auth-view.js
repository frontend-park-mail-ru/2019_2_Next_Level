import {AuthRenderState} from './auth-utility.js';
import Form from '../common/form/form.js';
import eventBus from '../../modules/event-bus.js';
import {partial} from '../../modules/partial.js';
import {ReplaceInnerRenderer} from '../../modules/renderer.js';
import {renderFest, addStyleSheet} from '../../modules/view-utility.js';

import '../../modules/string.js';
import './__sign-in-form/auth__sign-in-form.tmpl.js';
import './__sign-up-form/auth__sign-up-form.tmpl.js';


export default class AuthView {
	/**
	 * @constructor
	 * @param {AuthModel} authModel
	 */
	constructor(authModel) {
		this.authModel = authModel; // maybe to store form's data (hmm)

		addStyleSheet('/components/common/form/form.css');

		[
			'/settings/user-info',
			'/settings/security',
			'/messages/compose',
			'/messages/inbox',
			'/messages/sent',
		].forEach(page => {
			eventBus.addEventListener(`render:${page}`, this.authModel.dropRenderState);
		});

		[
			{
				page: 'sign-in',
				renderer: this.renderSignIn,
				renderState: AuthRenderState.RenderedSignIn,
			}, {
				page: 'sign-up',
				renderer: this.renderSignUp,
				renderState: AuthRenderState.RenderedSignUp,
			},
		].forEach(({page, renderer, renderState}) => {
			eventBus.addEventListener(`render:/auth/${page}`, partial(this.prerender, renderer, renderState));
		});

		eventBus.addEventListener('auth:sign-in-validate', this.signInDisplayMessage);
		eventBus.addEventListener('auth:sign-up-validate', this.signUpDisplayMessage);
	}

	prerender = (renderer, toRenderState) => {
		if (this.authModel.renderState !== toRenderState) {
			renderer();
			this.authModel.renderState = toRenderState;
		}
	};

	renderSignIn = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__center_auth-wrap',
			'components/auth/__sign-in-form/auth__sign-in-form.tmpl',
		);

		const form = document.querySelector('.form_sign-in');
		form.addEventListener('submit', event => {
			event.preventDefault();

			const login = form.elements.login.value;
			const password = form.elements.password.value;

			eventBus.emitEvent('auth:sign-in-button-clicked', {login, password});
		});
	};

	renderSignUp = () => {
		renderFest(
			ReplaceInnerRenderer,
			'.layout__center_auth-wrap',
			'components/auth/__sign-up-form/auth__sign-up-form.tmpl',
		);

		const form = document.querySelector('.form_sign-up');
		form.addEventListener('submit', event => {
			event.preventDefault();

			const firstName = form.elements.firstName.value;
			const secondName = form.elements.secondName.value;
			const birthDate = form.elements.birthDate.value;
			const sex = form.elements.sex.value;
			const login = form.elements.login.value;
			const password = form.elements.password.value;

			eventBus.emitEvent('auth:sign-up-button-clicked', {firstName, secondName, birthDate, sex, login, password});
		});
	};

	abstractDisplayMessage = (inputs, {inputName, message}) => {
		console.log('abstractDisplayMessage', inputs, inputName, message);
		inputs.forEach(input => {
			Form.displayMessage(input, '');
		});

		Form.displayMessage(inputName, message);
	};

	signInDisplayMessage = partial(this.abstractDisplayMessage, [
		'login',
		'password',
	]);

	signUpDisplayMessage = partial(this.abstractDisplayMessage, [
		'firstName',
		'secondName',
		'birthDate',
		// 'sex',
		'login',
		'password',
	]);
}
