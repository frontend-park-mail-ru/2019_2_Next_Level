'use strict';

/****** templates ******/
import './components/Header/Header.tmpl.js';
import './components/Main/Main.tmpl.js';
import './components/Auth/Auth.tmpl.js';
import './components/Auth/SignIn/SignIn.tmpl.js';
import './components/Auth/SignUp/SignUp.tmpl.js';
import './components/Form/FormBlock/FormBlock.tmpl.js';
import './components/Form/FormButton/FormButton.tmpl.js';
import './components/Form/FormRow/FormRow.tmpl.js';
import './components/Settings/Security/Security.tmpl.js';
import './components/Settings/UserInfo/UserInfo.tmpl.js';
import './components/Settings/Settings.tmpl.js';
import './components/Nav/Nav.tmpl.js';

import Application from './components/Application/Application.js';

const application = document.getElementById('application');

const app = new Application(application);
app.render();
