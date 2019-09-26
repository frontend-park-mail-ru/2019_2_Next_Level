'use strict';
 const express = require('express');
const body = require('body-parser');
const cookie = require('cookie-parser');
const morgan = require('morgan');
const uuid = require('uuid/v4');
const path = require('path');

const HTTP_STATUS = {
    created: 201,
    bad_request: 400,
};

 const app = express();

app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(body.json());
app.use(cookie());

 const users = {
  'a@mail.ru': {
     email: 'a@mail.ru',
	 password: "password",
	 name: "Ian",
	 sirname: "Ivanov",
	 middlename: "Ivanovih"
  },
 };
const ids = {};

 app.post('/signup', (req, res) => {
     const password = req.body.password;
     const email = req.body.email;
     if (
         !password || !email || !age ||
         !password.match(/^\S{4,}$/) ||
         !email.match(/@/) ||
         !(typeof age === 'number' && age > 10 && age < 100)
     ) {
         return res.status(HTTP_STATUS.bad_request).json({error: 'Invalid user data'});
     }
     if (users[email]) {
         return res.status(HTTP_STATUS.bad_request).json({error: 'User already exsists'});
     }

     const id = uuid();
     const user = {password, email, age, score: 0};

     ids[id] = email;
     users[email] = user;

     res.cookie('user-token', id, {expires: new Date(Date.now() + 1000*60*10)});
     res.status(HTTP_STATUS.created).json({id});
 });

 app.post('/signin', (req, res) => {
	 const password = req.body.password;
     const email = req.body.email;
	 console.log("Signin", email, password);
      if (!password || !email) {
          return res.status(HTTP_STATUS.bad_request).json({error: "Email or password are empty"});
      }

      if (!users[email] || users[email].password != password) {
          return res.status(HTTP_STATUS.bad_request).json({error: "Wrong email or password"});
      }

      const id = uuid();
      ids[id] = email;

     res.cookie('user-token', id, {expires: new Date(Date.now() + 1000 * 60 * 10)});

     res.status(HTTP_STATUS.created).end();
 });

 app.get('/profile', (req, res) => {
	 const id = req.cookies['user-token'];
     const email = ids[id];
	 console.log("Profile", id, email);
    if (!email || !users[email]) {
        res.status(HTTP_STATUS.bad_request).json({id});
    }
    res.json(users[email]);
 });

const port = process.env.PORT || 80;

app.listen(port, () => {
 console.log(`Start listening ${port} port`);
});

