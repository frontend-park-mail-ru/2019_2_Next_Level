// const backend = 'https://next-level-mail.kerimovdev.now.sh/';
import {Config} from '../config';
import eventBus from 'modules/event-bus.js';

// const backend = 'https://nextlevel.hldns.ru';
const backend = Config.backend;

/**
 * Fetch POST
 * @param   {string} url
 * @param   {Object} body
 * @returns {Promise<Response>}
 */

export const fetchFile = (url, body) => {
	console.log('fetchFile', url);
	return fetch(backend + url, {
		method: 'PUT',
		headers: {
			'Accept': 'multipart/form-data',
			// 'Content-Type': 'multipart/form-data',
		},
		body: body,
		credentials: 'include',
	});
}
export const fetchPost = (url, body) => {
	console.log('fetchPost', url, body);
	return fetch(backend + url, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
		credentials: 'include',
	});
};

/**
 * Fetch GET
 * @param   {string} url
 * @returns {Promise<Response>}
 */
export const fetchGet = url => {
	console.log('fetchGet', url);
	return fetch(backend + url, {
		method: 'GET',
		credentials: 'include',
	});
};

/**
 * Fetch GET with params
 * @param   {string} url
 * @param   {Object} params
 * @returns {Promise<Response>}
 */
export const fetchGetWithParams = (url, params) => {
	console.log('fetchGetWithParams', url, params);

	let fullUrl = new URL(backend + url);
	fullUrl.search = new URLSearchParams(params).toString();

	return fetch(fullUrl, {
		method: 'GET',
		credentials: 'include',
	});
};

/**
 * Fetch POST FormData
 * @param   {string} url
 * @param   {FormData} formData
 * @returns {Promise<Response>}
 */
export const fetchData = (url, formData) => {
	return fetch(backend + url, {
		method: 'POST',
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		body: formData,
		credentials: 'include',
	});
};

/**
 * Converts response to JSON
 * @param   {Promise<Response>} response
 * @returns {*|Promise<Object>}
 */
export const jsonizeResponse = response => {
	if (!response.ok) {
		throw new Error(`Response status is ${response.status}`);
	}

	return response.json();
};

/**
 * Logs error
 * @param error
 */
export const consoleError = error => {
	console.error(error);
};

/**
 * hmm today i will
 * @param   {Promise<Response>} response
 * @returns {Promise<Object>}
 */
export const jsonize = response => {
	return response
		.then(jsonizeResponse)
		.catch((error) => {
			if (!navigator.onLine) {
				console.log('BB: OFFLINE');
				consoleError(error);
				eventBus.emitEvent('prerender:/auth/offline', {});
			}
		});
};

