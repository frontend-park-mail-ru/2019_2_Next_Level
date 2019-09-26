import { RenderMethod } from "../../config.js";

export class Workspace {
    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data;
    }
    render(method=RenderMethod.append) {
        const module = window.fest['components/PersonalArea/Workspace/Workspace.tmpl'](this._data);
        switch(method){
            case RenderMethod.append:
                this._parent.innerHTML += module;
                break;
            case RenderMethod.replace:
                this._parent.innerHTML = module;
        }
    }
}