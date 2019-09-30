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
const Errors = require('../public/modules/errors.commonjs.inc');

const users = {
	'a@nlmail.ru': {
		password: 'password',
		name: 'Ivanov Ivan',
	},
	'admin@nlmail.ru': {
		password: 'admin',
		name: 'Admin',
	},
	'dr@hug.oz': {
		password: 'pass-go-hw',
		name: 'Moskovsky Dmitry',
	},
};

const ids = {};

const default_port = 3000;
const port = process.env.PORT || default_port;

app.listen(port, () => {
	console.log(`Server listening port ${port}`);
});

app.post('/api/auth/signup', (req, res) => {
	console.log('/api/auth/signup');

	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	if (!_check_name(name)) {
		console.log(Errors.InvalidName.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.InvalidName});
	}

	if (!_check_email(email)) {
		console.log(Errors.InvalidEmail.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.InvalidEmail});
	}

	if (!_check_password(password)) {
		console.log(Errors.InvalidPassword.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.InvalidPassword});
	}

	if (email in users) {
		console.log(Errors.UserExists.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.UserExists});
	}

	users[email] = {name, password};

	return signin(res, email);
});

app.post('/api/auth/signin', (req, res) => {
	console.log('/api/auth/signin');

	const email = req.body.email;
	const password = req.body.password;

	if (!(email in users)) {
		console.log(Errors.WrongEmail.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.WrongEmail});
	}

	if (users[email].password !== password) {
		console.log(Errors.WrongPassword.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.WrongPassword});
	}

	return signin(res, email);
});

app.get('/api/auth/signout', (req, res) => {
	console.log('/api/auth/signout');

	const session_id = req.cookies['user-token'];
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.NotAuthorized});
	}

	delete ids[session_id];
	return res.status(HttpStatus.OK).json({response: 'ok'});
});

app.get('/api/profile/get', (req, res) => {
	console.log('/api/profile/get');

	const session_id = req.cookies['user-token'];
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.NotAuthorized});
	}

	// for now it's impossible
	const email = ids[session_id];
	if (!email || !(email in users)) {
		console.log(Errors.NotAuthorized.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.NotAuthorized});
	}

	return res.status(HttpStatus.OK).json({email, 'name': users[email]['name']});
});

app.post('/api/profile/edit', (req, res) => {
	console.log('/api/profile/edit');

	const session_id = req.cookies['user-token'];
	if (!(session_id in ids)) {
		console.log(Errors.NotAuthorized.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.NotAuthorized});
	}

	// for now it's impossible
	const email = ids[session_id];
	if (!email || !(email in users)) {
		console.log(Errors.NotAuthorized.msg);
		return res.status(HttpStatus.BadRequest).json({error: Errors.NotAuthorized});
	}

	const name = req.body.name;
	const password = req.body.password;

	if (name) {
		users[email].name = name;
	} else if (password) {
		users[email].password = password;
	}

	return res.status(HttpStatus.OK).json({response: 'ok'});
});

const signin = (res, email) => {
	console.log('signin', email);

	const session_id = uuid();
	ids[session_id] = email;

	const ten_minutes = 10;
	const seconds_in_minute = 60;
	const milliseconds_in_second = 1000;
	const ten_minutes_in_milliseconds = ten_minutes * seconds_in_minute * milliseconds_in_second;

	res.cookie('user-token', session_id, {expires: new Date(Date.now() + ten_minutes_in_milliseconds)});
	return res.status(HttpStatus.OK).json({response: 'ok'});
};

const _check_name = name => name && name.match(/\w+/);
const _check_email = email => email && email.match(/@/);
const _check_password = password => password && password.match(/^\S{4,}$/);
