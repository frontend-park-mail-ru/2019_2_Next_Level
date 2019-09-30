/** builds ES6 and CommonJs includes */

const fs = require('fs');

const Errors = {
	WrongEmail: {code: 1, msg: 'Such email does not exists'},
	WrongPassword: {code: 2, msg: 'Wrong password'},
	NotAuthorized: {code: 3, msg: 'User is not authorized'},
	InvalidName: {code: 4, msg: 'Invalid name'},
	InvalidEmail: {code: 5, msg: 'Invalid email'},
	InvalidPassword: {code: 6, msg: 'Invalid password'},
	UserExists: {code: 7, msg: 'User with this email already exists'},
};

const ErrorsBody = JSON.stringify(Errors);

const callback = err => {
	if (err) {
		console.error(err);
	}
	console.log('file write successful');
};

fs.writeFile('public/modules/errors.es6.inc.js', 'export const Errors = ' + ErrorsBody + ';\n', callback);
fs.writeFile('public/modules/errors.commonjs.inc.js', 'module.exports = ' + ErrorsBody + ';\n', callback);
