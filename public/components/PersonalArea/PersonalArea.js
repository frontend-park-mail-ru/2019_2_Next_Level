import {MenuPanel} from './MenuPanel/MenuPanel.js';
import {Workspace} from './Workspace/Workspace.js';
import { RenderMethod } from '../config.js';
export class PersonalArea {
    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data;
    }
    render() {
        //this._parent.innerHTML = window.fest['components/SignUp/SignUp.tmpl'](this._data);
        let data = {};
        switch(this._data.page) {
            case 'profile':
                data = this._createProfile();
                break;
            default:
                console.error("Wrong page");
                return;
        }
        let mainMenuPanel = new MenuPanel(this._parent, data.mainMenu);
        mainMenuPanel.render(RenderMethod.replace);
        let workspace = new Workspace(this._parent, data.workspace);
        workspace.render();
    }

    _createProfile() {
        return {
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
                    {width: 3, title: "Name", type: "text"},
                    {width: 3, title: "Sirname", type: "text"},
                    {width: 3, title: "Middle name", type: "text"},
                    {width: 6, title: "Email", type: "email"},
                    {width: 2, button:{type: "submit", value: "Change", id:""}},
                    {width: 3, title: "Password", type: "password"},
                    {width: 3, title: "Repeat assword", type: "password"},
                    {width: 2, button:{type: "submit", value: "Change", id:""}},
                ]
            }
        }
    }

}