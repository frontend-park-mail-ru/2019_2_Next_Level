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


const checkData = (name, email, password) => {
	return name
	    && email
	    && password
	    && name.match(/\w+/)
	    && email.match(/@/)
	    && password.match(/^\S{4,}$/);
};

app.post('/api/auth/signup', (req, res) => {
	console.log('/api/auth/signup');

	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	if (!checkData(name, email, password)) {
		console.log('Invalid user data');
		return res.status(HttpStatus.BadRequest).json({error: 'Invalid user data'});
	}
	if (email in users) {
		console.log('User already exists');
		return res.status(HttpStatus.BadRequest).json({error: 'User already exists'});
	}

	users[email] = {name, password};

	return signin(res, email);
});

app.post('/api/auth/signin', (req, res) => {
	console.log('/api/auth/signin');

	const email = req.body.email;
	const password = req.body.password;

	// require attribute in html
	if (!email || !password) {
		console.log('Email and password are required');
		return res.status(HttpStatus.BadRequest).json({error: 'Email and password are required'});
	}

	if (!(email in users) || users[email].password !== password) {
		console.log('Wrind email or password');
		return res.status(HttpStatus.BadRequest).json({error: 'Wrong email or password'});
	}

	return signin(res, email);
});

app.get('/api/auth/signout', (req, res) => {
	console.log('/api/auth/signout');

	const session_id = req.cookies['user-token'];
	if (!(session_id in ids)) {
		console.log('User is not authorized');
		return res.status(HttpStatus.BadRequest).json({error: 'User is not authorized'});
	}

	delete ids[session_id];
	return res.status(HttpStatus.OK).json({response: 'ok'});
});

app.get('/api/profile/get', (req, res) => {
	console.log('/api/profile/get');

	const session_id = req.cookies['user-token'];
	if (!(session_id in ids)) {
		console.log('User is not authorized');
		return res.status(HttpStatus.BadRequest).json({error: 'User is not authorized'});
	}
	const email = ids[session_id];
	if (!email || !(email in users)) {
		return res.status(HttpStatus.BadRequest).json({session_id});
	}

	return res.status(HttpStatus.OK).json({email, 'name': users[email]['name']});
});

const signin = (res, email) => {
	console.log('signin', email);

	const session_id = uuid();
	ids[session_id] = email;

	const ten = 10;
	const seconds_in_minute = 60;
	const milliseconds_in_second = 1000;
	const ten_minutes = ten * seconds_in_minute * milliseconds_in_second;

	res.cookie('user-token', session_id, {expires: new Date(Date.now() + ten_minutes)});
	return res.status(HttpStatus.OK).json({response: 'ok'});
};

const default_port = 3000;
const port = process.env.PORT || default_port;

app.listen(port, () => {
	console.log(`Server listening port ${port}`);
});
