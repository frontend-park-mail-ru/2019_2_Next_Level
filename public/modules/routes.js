class Routes {
	constructor() {
		this.routes = new Map();
	}

    AddRoutes = (routes) => {
        this.routes = new Map([...this.routes, ...routes]);
    };

    GetRoutes = () => {
    	let list = [];
    	for (let route of this.routes.values()) {
    		list.concat(route);
    	}
    	return list;
    };

    GetModuleRoutes = (...moduleNames) => {
    	let list = [];
    	for (let name of moduleNames) {
    		list = list.concat([...this.routes.get(name)]);
    	}
    	return list;
    };

    GetModuleNames = () => {
        return [...this.routes.keys()];
    };

    forEach = (func) => {
        // this.routes.values().foreach(func);
		this.routes.forEach(value => {
            value.forEach(func);
        });
    };
}

export default new Routes();