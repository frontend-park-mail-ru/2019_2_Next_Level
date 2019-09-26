import {MenuPanel} from './MenuPanel/MenuPanel.js';
import {Workspace} from './Workspace/Workspace.js';
import {SignUp} from '/components/SignUp/SignUp.js';
import { RenderMethod } from '../config.js';
export class PersonalArea {
    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data;
    }
    render() {
        //this._parent.innerHTML = window.fest['components/SignUp/SignUp.tmpl'](this._data);
        console.log("render")
        let data = {};
        switch(this._data.page) {
            case 'profile':
                // data = this._createProfile();
                this._autorization();
                break;
            default:
                console.error("Wrong page");
                return;
        }
        // if (data){
        //     let mainMenuPanel = new MenuPanel(this._parent, data.mainMenu);
        //     mainMenuPanel.render(RenderMethod.replace);
        //     let workspace = new Workspace(this._parent, data.workspace);
        //     workspace.render();
        // }
    }

    _render(data) {
        if (data){
            let mainMenuPanel = new MenuPanel(this._parent, data.mainMenu);
            mainMenuPanel.render(RenderMethod.replace);
            let workspace = new Workspace(this._parent, data.workspace);
            workspace.render();
        }
    }

    _createProfile(personalData={}) {
        let config = {
            mainMenu: {
                header: "Settings",
                items: [
                    {name: "Accounts", level: 0},
                    {name: "admin@yandex.ru", level: 1},
                    {name: "Signature", level: 2},
                    {name: "Templates", level: 2},
                    {name: "user@yandex.ru", level: 1},
                ],
                buttonDirect: "back",
            },
            workspace: {
                header: "Account Settings",
                avatar: {
                    image: '/images/avatar-placeholder.png',
                },
                inputs: [
                    {width: 3, title: "Name", type: "text", name:"name"},
                    {width: 3, title: "Sirname", type: "text"},
                    {width: 3, title: "Middle name", type: "text"},
                    {width: 6, title: "Email", type: "email"},
                    {width: 2, button:{type: "submit", value: "Change", id:""}},
                    {width: 3, title: "Password", type: "password"},
                    {width: 3, title: "Repeat assword", type: "password"},
                    {width: 2, button:{type: "submit", value: "Change", id:""}},
                ], 
            }
        }
        //let personalData = this._autorization();
        if (personalData != null) {
            console.log('R',personalData);
            config.workspace.inputs[0].value = personalData.name;
            config.workspace.inputs[1].value = personalData.sirname;
            config.workspace.inputs[2].value = personalData.middlename;
            config.workspace.inputs[3].value = personalData.email;
            config.workspace.accountInfo = personalData;
            console.log("Authorized");
            this._render(config);
            return;
        }
        console.log("No autorization");
        (new SignUp(this._parent, {page: "signin",})).render()

    }

    _autorization() {
        console.log("autorization");
        AjaxModule.doGet({
            method:'GET', 
            url: '/profile', 
            body: null, 
            callback: (status, responseText) => {
                    if (status != 200) {
                        // alert('ACHTUNG! No autorization');
                        (new SignUp(this._parent, {page: "signin",})).render()
                        return;
                    }
                    try{
                        const responseBody = JSON.parse(responseText);
                        this._createProfile(responseBody);
                    }catch(e) {
                        return
                    }
                },
        });
    }

}