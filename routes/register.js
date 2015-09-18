var server = require('./serverConfig.js');

var connection = server.open();

exports.doReg = function(req,res){
	if(req.body['password'] != req.body['password2']){
		res.render('reg',{
			error2 : '密碼輸入不一致~',
		});
	}else if(req.body['account'].length >= 20){
		res.render('reg',{
			error2 : '帳號長度要小於20個字元喔!',
		});
	}else if(req.body['name'].length >= 20){
		res.render('reg',{
			error2 : '暱稱長度要小於20個字元喔!',
		});
	}else if(req.body['account'].length == 0){
		res.render('reg',{
			error2 : '帳號長度至少要1個字元喔!',
		});
	}else if(req.body['name'].length == 0){
		res.render('reg',{
			error2 : '暱稱長度要至少1個字元喔!',
		});
	}else if(req.body['password'].length == 0){
		res.render('reg',{
			error2 : '密碼長度要至少1個字元喔!',
		});
	}else{
		var q = 'insert into user(account,name,password,vid) values("' + req.body['account'] + '","' + req.body['name'] + '","' + req.body['password'] + '","1");';
		connection.query(q,function(error,result,fields){
			if(error){
				throw error;
				res.render('reg',{
					error : '帳戶有人使用了！',
				});
			}
			q = 'select * from user where account = "' + req.body['account'] + '";';
			connection.query(q,function(error,result,fields){
				if(error){
					throw error;
				}
				var user_id = result[0].id;
				q = 'insert into code(name,user_id,type,parent) values("/","' + user_id + '","0","-1");';
				connection.query(q,function(error,result,fields){
					if(error){
						throw error;
					}
					q = 'select id from code where user_id = "' + user_id + '";';
					connection.query(q,function(error,result,fields){
						if(error){
							throw error;
						}
						var vid = result[0].id;
						console.log('vid = ' + vid);
						q = 'update user set vid = "' + vid + '" where id = "' + user_id + '";';
						connection.query(q,function(error,result,fields){
							if(error){
								throw error;
							}
							res.cookie('name',req.body['name'],{path:'/'});
							req.session.isLogin = true;
							req.session.account = req.body['account'];
							req.session.firstLogin = true;
							return res.redirect('/home');
						});
					});
				});

			});
		});
	}
};
exports.doLogin = function(req,res){
	var q = 'select * from user where account = \"' + req.body['account'] + '\" && password = \"' + req.body['password'] + '\";';
	connection.query(q,function(error,result,fields){
		if(error){
			throw error;
		}
		if(result.length == 0){
			res.render('reg',{
				error : '帳號或密碼錯誤！',
				isLogin : false
			});
		}else{
			res.clearCookie();
			res.cookie('name',result[0].name,{path:'/'});
			req.session.isLogin = true;
			req.session.account = req.body['account'];
			req.session.firstLogin = true;
//			res.cookie('isLogin',true,{path:'/'});
			return res.redirect('/home');
//			res.render('home',{
//				isLogin : true
//			});
		}
	});
};
exports.doLogout = function(req,res){
	res.clearCookie('isLogin');
	req.session.isLogin = false;
	req.session.account = '';
	return res.redirect('/');
}
