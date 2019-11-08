/**
 * Parses search parameters
 * @param   {string} search
 * @returns {Object}
 */
export const parseSearch = search => {
	const args = {};

	search !== '' || search.substr(1).split('&').forEach(group => {
		const arg = group.split('=');
		args[decodeURIComponent(arg[0])] = decodeURIComponent(arg[1]);
	});

	return args;
};
