/** builds ES6 and CommonJs includes */

const fs = require('fs');

const callback = err => {
	if (err) {
		console.error(err);
	}
	console.log('file write successful');
};

module.exports = (moduleName, exports) => {
	let data_es6 = '';
	let data_commonjs = '';
	exports.forEach(e => {
		data_es6 += `export const ${e.declaration} = ${e.definition};\n`;
		data_commonjs += `module.exports.${e.declaration} = ${e.definition};\n`;
	});
	fs.writeFileSync(`public/modules/${moduleName}.es6.inc.js`, data_es6, callback);
	fs.writeFileSync(`server/${moduleName}.commonjs.inc.js`, data_commonjs, callback);
};
