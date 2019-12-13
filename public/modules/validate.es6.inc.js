export const checkLogin = login => /^(\w+\.)*\w+$/.test(login);
export const checkPassword = password => /^\S{4,}$/.test(password);
export const checkName = name => name.split(/\s+/).every(word => /^\w+\.?$/.test(word));
export const checkNickName = nickName => nickName.split(/\s+/).every(word => /^(\w+\.)*\w+\.?$/.test(word));
export const checkDate = date => {
	const g = date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
	return g && !isNaN((new Date(`${g[3]}-${g[2]}-${g[1]}`)).getTime());
};
export const checkSex = sex => /^(fe)?male$/.test(sex);
export const checkEmail = email => /@/.test(email);
export const checkFolder = folder => ['inbox', 'sent'].includes(folder);
