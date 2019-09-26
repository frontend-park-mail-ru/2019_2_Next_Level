(function(){
    const noop = () => null
    const XHR_MODE = {
        DONE: 4,
    };
    class AjaxModule {
        doGet({
            url='/', 
            body=null, callback=noop} = {}) {
                this._ajax({method:'GET', url, body, callback});
        }
    
        doPost({
            url='/', 
            body=null, callback=noop} = {}) {
                this._ajax({method:'POST', url, body, callback});
        }

        _ajax({method='GET', url='/', body=null, callback=noop}={}) {
            //function ajax(method, url, body = null, callback) {
                const xhr = new XMLHttpRequest();
                const isAsync = true;
                xhr.open(method, url, isAsync);
                xhr.withCredentials = true;
        
        
                xhr.addEventListener('readystatechange', () => {
                    if (xhr.readyState != XHR_MODE.DONE) return;
                    callback(xhr.status, xhr.response);
                });
        
                if (body) {
                    xhr.setRequestHeader('Content-type', 'application/json; charset=utf8');
                    xhr.send(JSON.stringify(body));
                } else {
                    xhr.send();
                }
            }
    }
    
    globalThis.AjaxModule = new AjaxModule()
})()