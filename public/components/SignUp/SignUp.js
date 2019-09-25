import {FormInput} from '/components/FormInput/FormInput.js';
import {Button} from '/components/Button/Button.js';
export class SignUp {

    pageParams = new Map([
        ['signup', {
            
            forms: [
                { title: "Name", type: "text",},
                { title: "Email", type: "email",},
                { title: "Password", type: "password",},
            ],
            button: {value: "Join!", type: "submit", id: ""},
        }],
        ['login', {
            
            forms: [
                { title: "Email", type: "email",},
                { title: "Password", type: "password",},
            ],
            button: {value: "Login!", type: "submit", id: ""},
        }],
    ]);

    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data;
    }
    render() {
        this._parent.innerHTML = window.fest['components/SignUp/SignUp.tmpl'](this._data);
        let form = this._parent.getElementsByClassName("login-form")[0];
        this.pageParams.get(this._data.page).forms.forEach((value) => {
            (new FormInput(form, value)).render();
        });
        (new Button(form,  this.pageParams.get(this._data.page).button)).render();

        let link = this._parent.querySelector(".central a");
        console.log(link);
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switch(this._data.page) {
                case 'signup':
                    this._createLogin();
                    break;
                case 'login':
                    this._createSignup();
                    break;
                default: console.error("Wrong data.page");
            }
        });
    }

    _createLogin() {
        this._data.page = "login";
        this.render();
    }

    _createSignup() {
        this._data.page = 'signup';
        this.render();
    }
}