/**
 * Fetch POST
 * @param   {string} url
 * @param   {Object} body
 * @returns {Promise<Response>}
 */
export const fetchPost = (url, body) => {
	console.log('fetchPost', url, body);
	return fetch(url, {
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
export const fetchGet = (url) => {
	console.log('fetchGet', url);
	return fetch(url, {
		method: 'GET',
		credentials: 'include',
	});
};
