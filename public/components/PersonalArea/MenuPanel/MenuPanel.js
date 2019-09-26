import { RenderMethod } from "../../config.js";

export class MenuPanel {
    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data;
    }
    render(method=RenderMethod.append) {
        let module = window.fest['components/PersonalArea/MenuPanel/MenuPanel.tmpl'](this._data);
        switch(method){
            case RenderMethod.append:
                this._parent.innerHTML += module;
                break;
            case RenderMethod.replace:
                this._parent.innerHTML = module;
        }
    }
}