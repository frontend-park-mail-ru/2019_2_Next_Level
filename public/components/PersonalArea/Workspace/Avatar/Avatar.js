export class Avatar {
    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data
    }
    render() {
        let module = window.fest['components/PersonalArea/Avatar/Avatar.tmpl'](this._data);
        switch(method){
            case RenderMethod.append:
                this._parent.innerHTML += module;
                break;
            case RenderMethod.replace:
                this._parent.innerHTML = module;
        }
    }
}