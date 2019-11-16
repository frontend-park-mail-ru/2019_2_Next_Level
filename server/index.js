'use strict';

const express = require('express');
const body = require('body-parser');
const cookie = require('cookie-parser');
const morgan = require('morgan');
const uuid = require('uuid/v4');
const path = require('path');
const fallback = require('express-history-api-fallback');

const app = express();

app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'dist')));
// app.use(fallback('index.html', { root: 'dist' }));
app.use(body.urlencoded({extended: true}));
app.use(body.json());
app.use(cookie());

const HttpStatus = require('./http_status');
const {Errors} = require('./errors.commonjs.inc');
const {checkName, checkNickName, checkDate, checkSex, checkLogin, checkPassword, checkEmail, checkFolder} = require('./validate.commonjs.inc');

const users = {
	'user': {
		password: 'password',
		firstName: 'Ivan',
		secondName: 'Ivanov',
		nickName: 'Ivan Ivanov',
		avatar: null,
		birthDate: '01.01.1970',
		sex: 'male',
	},
};

const ids = {};

const default_port = 3000;
const port = process.env.PORT || default_port;

app.listen(port, () => {
	console.log(`Server listening port ${port}`);
});

const jsonizeError = error => ({status: 'error', error});
const response = (res, json) => res.status(HttpStatus.OK).json(json);

[
	'/',
	'/auth/sign-in',
	'/auth/sign-up',
	'/settings/user-info',
	'/settings/security',
	'/messages/compose',
	'/messages/inbox',
	'/messages/sent',
	'/messages/message',
].forEach(pathname => app.get(pathname, (req, res) => {
	res.sendFile(path.join(__dirname, '../dist', 'index.html'));
}));

app.get('/api/auth/isAuthorized', (req, res) => {
	console.log('/api/auth/isAuthorized');

	const {session_id} = req.cookies;
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	return response(res, {status: 'ok'});
});

app.post('/api/auth/signIn', (req, res) => {
	console.log('/api/auth/signIn');

	const {login, password} = req.body;
	if (!(login in users)) {
		console.log(Errors.WrongLogin.msg);
		return response(res, jsonizeError(Errors.WrongLogin));
	}

	if (users[login].password !== password) {
		console.log(Errors.WrongPassword.msg);
		return response(res, jsonizeError(Errors.WrongPassword));
	}

	return signIn(res, login);
});

const signIn = (res, login) => {
	console.log('signIn', login);

	const session_id = uuid();
	ids[session_id] = login;

	res.cookie('session_id', session_id, {expires: new Date(Date.now() + 1000*60*10)});
	return response(res, {status: 'ok'});
};

app.post('/api/auth/signUp', (req, res) => {
	console.log('/api/auth/signUp');

	const {firstName, secondName, birthDate, sex, login, password} = req.body;

	const checks = [
		{check: checkName, variable: firstName, error: Errors.InvalidFirstName},
		{check: checkName, variable: secondName, error: Errors.InvalidSecondName},
		{check: checkDate, variable: birthDate, error: Errors.InvalidBirthDate},
		{check: checkSex, variable: sex, error: Errors.InvalidSex},
		{check: checkLogin, variable: login, error: Errors.InvalidLogin},
		{check: checkPassword, variable: password, error: Errors.InvalidPassword},
		{check: user => !(user in users), variable: login, error: Errors.UserExists},
	];

	for (let c of checks) {
		if (!c.check(c.variable)) {
			console.log(c.error.msg);
			return response(res, jsonizeError(c.error));
		}
	}

	users[login] = {firstName, secondName, nickName: `${firstName} ${secondName}`, avatar: null, birthDate, sex, password};

	return signIn(res, login);
});

app.get('/api/auth/signOut', (req, res) => {
	console.log('/api/auth/signOut');

	const {session_id} = req.cookies;
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	delete ids[session_id];
	return response(res, {status: 'ok'});
});

const auth = req => {
	const {session_id} = req.cookies;
	if (!(session_id in ids)) {
		return false;
	}

	// for now it's impossible
	const login = ids[session_id];
	if (!login || !(login in users)) {
		return false;
	}

	return login;
};

app.get('/api/profile/get', (req, res) => {
	console.log('/api/profile/get');

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	return response(res, {
		status: 'ok',
		userInfo: {
			login: login,
			firstName: users[login].firstName,
			secondName: users[login].secondName,
			nickName: users[login].nickName,
			avatar: users[login].avatar,
			birthDate: users[login].birthDate,
			sex: users[login].sex,
		},
	});
});

app.post('/api/profile/editUserInfo', (req, res) => {
	console.log('/api/profile/editUserInfo');

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	const {firstName, secondName, nickName, birthDate, sex, avatar} = req.body.userInfo;
	console.log(firstName, secondName, nickName, birthDate, sex, avatar);

	const checks = [
		{check: checkName, variable: firstName, error: Errors.InvalidFirstName},
		{check: checkName, variable: secondName, error: Errors.InvalidSecondName},
		{check: checkNickName, variable: nickName, error: Errors.InvalidNickName},
		{check: checkDate, variable: birthDate, error: Errors.InvalidBirthDate},
		{check: checkSex, variable: sex, error: Errors.InvalidSex},
	];

	for (let c of checks) {
		if (!c.check(c.variable)) {
			console.log(c.error.msg);
			return response(res, jsonizeError(c.error));
		}
	}

	users[login].firstName = firstName;
	users[login].secondName = secondName;
	users[login].nickName = nickName;
	users[login].birthDate = birthDate;
	users[login].sex = sex;

	return response(res, {status: 'ok'});
});

app.post('/api/profile/editPassword', (req, res) => {
	console.log('/api/profile/editPassword');

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	const {currentPassword, newPassword} = req.body;

	const checks = [
		{check: pass => pass === users[login].password, variable: currentPassword, error: Errors.WrongPassword},
		{check: checkPassword, variable: newPassword, error: Errors.InvalidPassword},
		{check: pass => !(pass === users[login].password), variable: newPassword, error: Errors.SamePasswords},
	];

	for (let c of checks) {
		if (!c.check(c.variable)) {
			console.log(c.error.msg);
			return response(res, jsonizeError(c.error));
		}
	}

	users[login].password = newPassword;

	return response(res, {status: 'ok'});
});

const messages = {
	'user': [
		{
			id: 1,
			folder: 'inbox',
			read: false,
			from: {
				name: 'long long long long long long long',
				email: 'pop@pop.ru',
			},
			to: [
				'user@nlmail.ru',
			],
			subject: 'Today i willl hmm hmmm hmmmmmmm hmmmmmmmm hmmmmmmm htmmmm',
			content: 'COnntetnn',
			date: (new Date(2010, 9, 10, 10, 10, 12)).toISOString(),
			deleted: false,
		}, {
			id: 2,
			folder: 'inbox',
			read: false,
			from: {
				name: 'Instagram',
				email: 'i@nstagra.m',
			},
			to: [
				'user@nlmail.ru',
			],
			subject: 'Subject hmmmmmmmmmmmmm',
			content: 'Sooooooo oconton asldk falksdjfla jsdl jalskdjf laksjdfl kajsdlkf jasldkj',
			date: (new Date(2019, 9, 28, 11, 12, 12)).toISOString(),
			deleted: false,
		}, {
			id: 3,
			folder: 'inbox',
			read: false,
			from: {
				name: 'Google',
				email: 'google@gmail.com',
			},
			to: [
				'user@nlmail.ru',
			],
			subject: 'Subject a bit longer',
			content: 'Content content content Content content content Content content content Content content content...',
			date: (new Date(2019, 10, 7, 16,23, 12)).toISOString(),
			deleted: false,
		}, {
			id: 4,
			folder: 'inbox',
			read: false,
			from: {
				name: 'Google',
				email: 'google@gmail.com',
			},
			to: [
				'user@nlmail.ru',
			],
			subject: 'Subject',
			content: 'Content content content Content content content Content content content Content content content...',
			date: (new Date()).toISOString(),
			deleted: false,
		}, {
			id: 5,
			folder: 'sent',
			read: true,
			to: [
				'pop@mail.ru',
				'kek@kek.ek',
			],
			from: {
				email: 'user@nlmail.ru',
			},
			subject: 'git stash',
			content: 'git stash pop',
			date: (new Date()).toISOString(),
			deleted: false,
		},
	],
};

var SERIAL = 6;

app.get('/api/messages/getUnreadCount', (req, res) => {
	console.log('/api/messages/getUnreadCount');

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	const {folder} = req.body;

	if (!checkFolder(folder)) {
		console.log(Errors.InvalidFolder.msg);
		return response(res, jsonizeError(Errors.InvalidFolder));
	}

	const msgs = messages[login] || (messages[login] = []);
	const count = msgs.filter(msg => msg.folder === folder && !msg.read && !msg.deleted).length;
	return response(res, {status: 'ok', count});
});

app.get('/api/messages/get', (req, res) => {
	console.log('/api/messages/get');

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	const {id} = req.query;

	const msgs = messages[login] || (messages[login] = []);
	const msg = msgs.filter(msg => msg.id === +id);
	if (!msg.length) {
		console.error(Errors.WrongMessage.msg);
		return response(res, jsonizeError(Errors.WrongMessage));
	}
	const message = msg[0];
	return response(res, {status: 'ok', message});
});

app.get('/api/messages/getByPage', (req, res) => {
	console.log('/api/messages/getByPage');

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	// const {perPage, page, folder} = req.body;
	const {folder} = req.query;
	if (!checkFolder(folder)) {
		console.log(Errors.InvalidFolder.msg);
		return response(res, jsonizeError(Errors.InvalidFolder));
	}

	const msgs = messages[login] || (messages[login] = []);
	const mf = msgs.filter(msg => msg.folder === folder);
	mf.reverse();
	return response(res, {status: 'ok', 'messages': mf, page: 1, pageCount: 1});
});

app.post('/api/messages/send', (req, res) => {
	console.log('/api/messages/send');

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	const {to, subject, content} = req.body.message;

	for (let email of to) {
		if (!checkEmail(email)) {
			return response(res, jsonizeError(Errors.InvalidEmail));
		}
	}

	if (!subject.trim().length) {
		return response(res, jsonizeError(Errors.EmptySubject));
	}

	if (!content.trim().length) {
		return response(res, jsonizeError(Errors.EmptyContent));
	}

	if (content.length > 1024) {
		return response(res, jsonizeError(Errors.ContentTooLarge));
	}

	messages[login].push({
		id: SERIAL,
		folder: 'sent',
		read: true,
		to,
		from: {
			name: users[login].nickName,
			email: `${login}@nlmail.ru`,
		},
		subject,
		content,
		date: (new Date()).toISOString(),
		deleted: false,
	});

	++SERIAL;

	return response(res, {status: 'ok'});
});

const abstractReadUnreadRemoveCallback = (field, value, req, res) => {
	console.log('abstractReadUnreadRemoveCallback', field, value);

	const login = auth(req);
	if (!login) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	const ids = req.body.messages;
	messages[login].forEach(msg => {
		if (ids.includes(msg.id)) {
			msg[field] = value;
		}
	});

	return response(res, {status: 'ok'});
};

function partial(func, ...argsBound) {
	return function(...args) {
		return func.call(this, ...argsBound, ...args);
	};
}

app.post('/api/messages/read', partial(abstractReadUnreadRemoveCallback, 'read', true));
app.post('/api/messages/unread', partial(abstractReadUnreadRemoveCallback, 'read', false));
app.post('/api/messages/remove', partial(abstractReadUnreadRemoveCallback, 'deleted', true));
