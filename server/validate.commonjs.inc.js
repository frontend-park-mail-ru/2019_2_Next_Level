module.exports.checkLogin = login => /^(\w+\.)*\w+$/.test(login);
module.exports.checkPassword = password => /^\S{4,}$/.test(password);
module.exports.checkName = name => name.split(/\s+/).every(word => /^\w+\.?$/.test(word));
module.exports.checkNickName = nickName => nickName.split(/\s+/).every(word => /^(\w+\.)*\w+\.?$/.test(word));
module.exports.checkDate = date => {
	const g = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
	return g && !isNaN((new Date(`${g[3]}-${g[2]}-${g[1]}`)).getTime());
};
module.exports.checkSex = sex => /^(fe)?male$/.test(sex);
module.exports.checkEmail = email => /@/.test(email);
module.exports.checkFolder = folder => ['inbox', 'sent'].includes(folder);
