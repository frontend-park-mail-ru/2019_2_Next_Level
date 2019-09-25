export class Button {
    constructor(parent = document.body, data = {}) {
        this._parent = parent;
        this._data = data
    }
    setError(text) {
        //this._data.error = text;
    }
    render() {
        this._parent.innerHTML += window.fest['components/Button/Button.tmpl'](this._data);
    }
}