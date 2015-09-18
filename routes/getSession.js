exports.getAccount = function(req){
	var time = new Date();
	if(time.getTime() - req.session.lastLogin < 500){
		console.log('Bad Request!');
		req.session.destroy();
		return ' ';
	}
	req.session.lastLogin = time.getTime();
	return req.session.account;
}
exports.getAccountNoTime = function(req){
	return req.session.account;
}

exports.getIsLogin = function(req){
	return req.session.isLogin;
}
