'use strict';

/****** templates ******/
import './components/common/Button/Button.tmpl.js';
import './components/common/Form/Form.tmpl.js';
import './components/common/FormBlock/FormBlock.tmpl.js';
import './components/Profile/Profile.tmpl.js';
import './components/SignIn/SignIn.tmpl.js';
import './components/SignUp/SignUp.tmpl.js';

import {Application} from './components/Application/Application.js';

const application = document.getElementById('application');

const app = new Application(application);
app.render();
