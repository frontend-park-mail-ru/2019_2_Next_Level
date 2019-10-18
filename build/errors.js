const inc = require('./inc.js');

const Errors = {
	UnknownError: {code: 1, msg: 'Unknown error'},
	UnknownMethod: {code: 2, msg: 'Unknown method'},
	InvalidRequest: {code: 3, msg: 'Invalid request'},
	NotAuthorized: {code: 4, msg: 'User is not authorized'},
	AccessDenied: {code: 5, msg: 'Access denied'},

	WrongLogin: {code: 10, msg: 'Such login does not exists'},
	WrongPassword: {code: 11, msg: 'Wrong password'},
	InvalidFirstName: {code: 12, msg: 'Invalid first name'},
	InvalidSecondName: {code: 13, msg: 'Invalid second name'},
	InvalidNickName: {code: 14, msg: 'Invalid nickname'},
	InvalidBirthDate: {code: 15, msg: 'Invalid birthDate'},
	InvalidSex: {code: 16, msg: 'Invalid sex'},
	InvalidLogin: {code: 17, msg: 'Invalid login'},
	InvalidPassword: {code: 18, msg: 'Invalid password'},
	UserExists: {code: 19, msg: 'User with this login already exists'},
	SamePasswords: {code: 20, msg: 'Passwords are same'},
};

inc('errors', [{declaration: 'Errors', definition: JSON.stringify(Errors)}]);
