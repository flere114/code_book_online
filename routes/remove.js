var getSession = require('./getSession');
var server = require('./serverConfig');
var tree = require('./tree');
var fs = require('fs');
var connection = server.open();

function sortByName(a,b){
	var c=a.name.toLowerCase(), d=b.name.toLowerCase();
	return c < d ? -1 : 1;
};
var removeFunc = function (arr, res) {
	if (arr.length > 0) {
		var deleteQuery = 'DELETE FROM code WHERE id = "' + arr[0].id + '"';
		var selectQuery = 'SELECT id, type, path FROM code WHERE parent = "' + arr[0].id + '"';
		for (var i = 1; i < arr.length; i++) {
			deleteQuery += ' OR id = "' + arr[i].id + '"';
			selectQuery += ' OR parent = "' + arr[i].id + '"';
		}
		deleteQuery += ';';
		selectQuery += ';';

		connection.query(deleteQuery, function(error, result, fields) {});	// 刪除該層的所有檔案 
		connection.query(selectQuery, function(error, result, fields) {		// 查詢下一層的所有檔案
			if (error) {
				return ;//res.status(400).end();
			}

			for (var i = 0; i < result.length; i++) {
				if (result[i].type != 0) {		// 刪掉 code 不是folder的都要刪掉實體檔案
					fs.unlink(result[i].path, function(err) {});
				}
			}
			removeFunc(result, res);
		});
	} else {
		return;
	}
};

exports.removeObject = function (req, res) {
	var account = getSession.getAccount(req);
	var code_id = req.body.code_id;

	var query = 'SELECT * FROM user, code WHERE user.id = code.user_id AND user.account = "' + account + '" AND code.id = "' + code_id + '";';
	connection.query(query, function(error, result, fields) {
		if (error || result.length != 1) {
			return res.status(400).end();
		}

		if (result[0].name === "/") {		// 不能刪掉 root
			return res.status(400).end();
		}

		if (result[0].type != 0) {
			fs.unlink(result[0].path, function(err) {});		
		}

		var arr = [];
		arr.push({id : code_id});
		removeFunc(arr, res);
		
		var query = 'SELECT id,name,type,parent FROM code WHERE user_id = "' + result[0].user_id + '";';
		connection.query(query,function(error,result,fields){
			if(error){
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
};	
