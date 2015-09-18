var cookieParser = require("cookie-parser");
var server = require('./serverConfig');
var getSession = require("./getSession");
var tree = require("./tree");

var connection = server.open();

exports.regPage = function(req,res){
	if (getSession.getIsLogin(req)) {
		return res.redirect("/home");
	}
	res.render('reg',{
		isLogin : getSession.getIsLogin(req) 
	});
};

exports.home = function(req,res){
	if(req.session.isLogin){
		var account = getSession.getAccountNoTime(req);
		tree.genHTML(req,res,'home',{
			isLogin : true,
			name : req.cookies.name
		});
		/*var tmp = tree.getTree(getSession.getAccount(req));
		console.log('tmp = ' + tmp);
		res.render('home',{
			isLogin : getSession.getIsLogin(req),
			name : req.cookies.name
		});*/
	}else{
		return res.redirect('/');
	}
};

/*
exports.editor = function (req, res) {
	var account = getSession.getAccount(req);
	var query = 'SELECT vid, id FROM user WHERE account = "' + account + '";';
	
	connection.query(query, function(error, result, fields) {
		if (error || result.length == 0 || !getSession.getIsLogin(req)) {
			return res.redirect("/");
		}
		tree.genHTML(req,res,'editor',{
			isLogin : getSession.getIsLogin(req),
			name : req.cookies.name
		});
	});
};
*/

exports.codebook = function (req, res) {
	var account = getSession.getAccountNoTime(req);
	var query = 'SELECT vid, id FROM user WHERE account = "' + account + '";';
	
	connection.query(query, function(error, result, fields) {
		if (error || result.length == 0 || !getSession.getIsLogin(req)) {
			return res.redirect("/");
		}

		tree.genHTML(req,res,'codebook',{
			isLogin : getSession.getIsLogin(req),
			name : req.cookies.name
		});
	});
}
