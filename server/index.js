'use strict';

const express = require('express');
const body = require('body-parser');
const cookie = require('cookie-parser');
const morgan = require('morgan');
const uuid = require('uuid/v4');
const path = require('path');

const app = express();

app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(body.urlencoded({extended: true}));
app.use(body.json());
app.use(cookie());

const HttpStatus = require('./http_status');
const {Errors} = require('./errors.commonjs.inc');
const {checkName, checkNickName, checkDate, checkSex, checkLogin, checkPassword} = require('./validate.commonjs.inc');

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

app.get('/api/profile/get', (req, res) => {
	console.log('/api/profile/get');

	const {session_id} = req.cookies;
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	// for now it's impossible
	const login = ids[session_id];
	if (!login || !(login in users)) {
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

	const {session_id} = req.cookies;
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	// for now it's impossible
	const login = ids[session_id];
	if (!login || !(login in users)) {
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

	const {session_id} = req.cookies;
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return response(res, jsonizeError(Errors.NotAuthorized));
	}

	// for now it's impossible
	const login = ids[session_id];
	if (!login || !(login in users)) {
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
