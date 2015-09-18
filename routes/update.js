var getSession = require('./getSession');
var server = require('./serverConfig');
var fs = require('fs');
var tree = require('./tree');
var connection = server.open();

var userID;

exports.updateCode = function (req, res) {
	var account = getSession.getAccount(req);
	var code_id = req.body["parent_code_ID"];
	var query = 'SELECT user.id, code.path, code.parent, code.name, code.type FROM code, user WHERE user.id = code.user_id '
			+ 'AND user.account = "' + account + '" AND code.id = "' + code_id + '";';
	
	connection.query(query, function(error, result, fields) {
		if (error || result.length != 1) {
			return res.redirect("/");
		}
		var oldName = result[0].name;
		var user_id = result[0].id;
		var path = result[0].path;
		var pre = result[0].parent;
		var date = new Date();
		var oldType = result[0].type;
		var type = req.body["codeType"];
		var extension = server.codeType[type].type;
		var newPath = "/var/www/code/" + date.getFullYear() + date.getMonth() + date.getDate() 
				+ date.getHours() + date.getMinutes() + date.getSeconds()
				+ "-" + account + "-" + name + extension;
		var verify = user_id + "-" + pre + "-" + name + "-" + type;

		if (name === oldName && type === oldType) {
			var code = req.body["codeArea"];
			fs.unlink(path, function(err) {});
			fs.writeFile(path, code, function(err) {});
			return res.redirect("/home");
		}

		var query = 'UPDATE code SET name = "' + name + '", path = "' + newPath + '", type = "' + type + '", verify = "' + verify + '" WHERE id = "' + code_id + '";';
		console.log(query);
		connection.query(query, function(error, result, fields) {
			var code = req.body["codeArea"];
			
			if (error) {
				fs.unlink(path, function(err) {});
				fs.writeFile(path, code, function(err) {});
				return res.redirect("/home");
			}

			fs.unlink(path, function(err) {});
			fs.writeFile(newPath, code, function(err) {});
			return res.redirect("/home");
		});
	});
};

exports.updateName = function (req, res) {
	var account = getSession.getAccount(req);
	var id = req.body.code_id;		// get id from req body
	var query = 'SELECT user.id, code.parent, code.name, code.type FROM code, user WHERE user.id = code.user_id AND user.vid != code.id '
			+ 'AND user.account = "' + account + '" AND code.id = "' + id + '";';
	
	connection.query(query, function(error, result, fields) {
		if (error || result.length != 1) {
			console.log("Not found or Error!");
			return res.status(400).end();
			//return res.redirect("/");
		}
		var name = req.body.name; // get name from req body
		if (name === "") {
			//return res.status(400).send('Bad Request');
			return res.status(400).end();
		}
		var oldName = result[0].name;
		var user_id = result[0].id;
		var pre = result[0].parent;
		var type = result[0].type;
		var verify = user_id + "-" + pre + "-" + name + "-" + type;

		if (name === oldName) {
			//return res.status(200).send('OK!');
			return res.status(200).end();
		}

		var query = 'UPDATE code SET name = "' + name + '", verify = "' + verify + '" WHERE id = "' + id + '";';
		connection.query(query, function(error, result, fields) {
			if (error) {
				//return res.status(400).send('Bad Request');
				return res.status(400).end();
			}
			
			return res.status(200).end();
		});
	});
};

var updatePathFunc = function (code_id, parent_id, now_id, res) {
	var query = 'SELECT name, parent FROM code WHERE id = "' + now_id + '";';
	connection.query(query, function(error, result, fields) {
		if (error || result.length != 1) {
			return res.status(400).end();
		}

		if (code_id == result[0].parent) {			// 目的地在檔案的sub tree
			return res.status(400).end();
		} else if (result[0].name == "/") { 		// trace 到 root, 代表目的地不在subtree, 可以更新路徑
			var query = 'SELECT user_id, name, type FROM code WHERE id = "' + code_id + '";';
			connection.query(query, function(error, result, fields) {
				if (error || result.length != 1) {
					return res.status(400).end();
				}

				var verify = result[0].user_id + "-" + parent_id + "-" + result[0].name + "-" + result[0].type;
				var query = 'UPDATE code SET parent = "' + parent_id + '", verify = "' + verify + '"  WHERE id = "' + code_id + '";';
				connection.query(query, function(error, result, fields) {
					if (error) {
						console.log(error); 		// 目的地下有名稱衝突的檔案存在
						return res.status(400).end();
					}
					var query = 'select id,name,parent,type from code where user_id = "' + userID + '";';
					connection.query(query, function(error, result, fields){
						if (error) {
							console.log(error);
							return res.status(400).end();
						}
						var vid;
						for(var i=0;i<result.length;i++)
							if(result[i].parent == -1)
								vid = result[i].id;
						var ret = '{"rebuildHTML":"' + tree.rebuildTree(vid,result) + '"}';
						res.writeHead(200,{"content-Type":"application/json","content-length":ret.length});
						return res.end(ret);
					});
				});
			});
		} else {									// 繼續往上 trace
			updatePathFunc(code_id, parent_id, result[0].parent, res);
		}
	});
};

exports.updatePath = function (req, res) {
	var account = getSession.getAccount(req);
	var code_id = req.body.code_id;
	var parent_id = req.body.parent_id;

	if (code_id === parent_id) {
		return res.status(400).end();
	}

	var query = 'SELECT * FROM user, code WHERE user.id = code.user_id AND user.account = "' + account + '" AND code.id = "' + code_id + '";';
	connection.query(query, function(error, result, fields) {
		if (error || result.length != 1) {								// 移動的檔案不存在
			console.log('error in exports.updatePath function, first query');
			return res.status(400).end();
		}		
		userID = result[0].user_id;

		var query = 'SELECT type FROM user, code WHERE user.id = code.user_id AND user.account = "' + account + '" AND code.id = "' + parent_id + '";';
		connection.query(query, function(error, result, field) {
			if (error || result.length != 1 || result[0].type != 0) {	// 目的地不存在或是不是folder
				console.log('error in exports.updatePath function, second query');
				return res.status(400).end();
			}
			updatePathFunc(code_id, parent_id, parent_id, res);
		});
	});
};
