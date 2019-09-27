import {FormInput} from '/components/FormInput/FormInput.js';
import {Button} from '/components/Button/Button.js';
import { PersonalArea } from '../PersonalArea/PersonalArea.js';
import { RenderMethod } from '/components/config.js';
export class SignUp {

    pageParams = new Map([
        ['signup', {
            
            forms: [
                { title: "Name", type: "text",name:"name"},
                { title: "Email", type: "email", name:"email"},
                { title: "Password", type: "password",name:"password"},
            ],
            button: {value: "Join!", type: "submit", id: ""},
        }],
        ['signin', {
            
            forms: [
                { title: "Email", type: "email", name:"email"},
                { title: "Password", type: "password",name:"password"},
            ],
            button: {value: "Login!", type: "submit", id: ""},
        }],
    ]);

    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data;
    }
    render() {
        switch(this._data.page) {
            case 'signup':
                console.log("signin-but")
                this._createSignup();
                break;
            case 'signin':
                console.log("signup-but")
                this._createLogin();
                break
            default: console.error("Wrong data.page");
        }
    }
    _render() {
        
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
                    console.log("signin-but")
                    this._createLogin();
                    break;
                case 'signin':
                    console.log("signup-but")
                    this._createSignup();
                    break
                default: console.error("Wrong data.page");
            }
        });
    }

    _createLogin() {
        this._data.page = "signin";
        this._render();
        let form = this._parent.querySelector("form");
        console.log('WE', form);
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Event")

            const email = form.elements['email'].value;
            const password = form.elements['password'].value;

            console.log(email, password);
            globalThis.AjaxModule.doPost({
                url: '/signin', 
                body: {email, password}, 
                callback: (status, responceText) => {
                    if (status === 200) {
                        // _createProfile();
                        console.log("Logged in");
                        (new PersonalArea(this._parent, {page: "profile"})).render(RenderMethod.replace);
                        return;
                    }
                    const {error} = JSON.parse(responceText);
                    // alert(error);
                },
            });
        });
    }

    _createSignup() {
        this._data.page = 'signup';
        this._render();

        let form = this._parent.querySelector("form");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Event-register")

            const name = form.elements['name'].value;
            const email = form.elements['email'].value;
            const password = form.elements['password'].value;

            console.log(email, password);
            globalThis.AjaxModule.doPost({
                url: '/signup', 
                body: {name, email, password}, 
                callback: (status, responceText) => {
                    if (status === 200) {
                        console.log("Registered");
                        (new PersonalArea(this._parent, {page: "profile"})).render(RenderMethod.replace);
                        return;
                    }
                    const {error} = JSON.parse(responceText);
                    // alert(error);
                },
            });
        });
    }

    _createProfile() {
        (new PersonalArea(app, {page: "profile"})).render(RenderMethod.replace);
    }
}