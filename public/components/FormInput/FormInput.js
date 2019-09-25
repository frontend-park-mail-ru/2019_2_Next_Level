export class FormInput {
    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data
    }
    render() {
        this._parent.innerHTML += window.fest['components/FormInput/FormInput.tmpl'](this._data);
    }
}