const inc = require('./inc.js');

const checkLogin = login => /^(\w+\.)*\w+$/.test(login);

const checkPassword = password => /^\S{4,}$/.test(password);

const checkName = name => name.split(/\s+/).every(word => /^\w+\.?$/.test(word));

const checkNickName = nickName => nickName.split(/\s+/).every(word => /^(\w+\.)*\w+\.?$/.test(word));

const checkDate = date => {
	const g = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
	return g && !isNaN((new Date(`${g[3]}-${g[2]}-${g[1]}`)).getTime());
};

const checkSex = sex => /^(fe)?male$/.test(sex);

inc('validate', [
	{declaration: 'checkLogin', definition: String(checkLogin)},
	{declaration: 'checkPassword', definition: String(checkPassword)},
	{declaration: 'checkName', definition: String(checkName)},
	{declaration: 'checkNickName', definition: String(checkNickName)},
	{declaration: 'checkDate', definition: String(checkDate)},
	{declaration: 'checkSex', definition: String(checkSex)},
]);
