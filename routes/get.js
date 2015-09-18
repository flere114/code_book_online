var getSession = require('./getSession');
var server = require('./serverConfig');
var fs = require('fs');
var connection = server.open();

exports.getCode = function (req, res) {
	var account = getSession.getAccount(req);
	var code_id = req.body.code_id;

	var query = 'SELECT code.name, code.path, code.type FROM user, code '
				+ 'WHERE user.id = code.user_id AND user.account = "' + account + '" AND code.id = "' + code_id + '";';
	connection.query(query, function(error, result, fields) {
		if (error || result.length == 0) {
			return res.status(404).send('Not found');
		}

		var path = result[0].path;
		var name = result[0].name;
		var type = result[0].type;
		var mode = server.codeType[type].mode;

		fs.readFile(path, 'utf8', function(error, data) {
			if (error) {
				return res.status(404).send('Not found');	
			}
			res.json({"code" : data, "name" : name, "mode" : mode, "type" : type});
		});
	});
};

exports.getObjects = function (req, res) {
	var account = getSession.getAccount(req);
	var pre = req.body.parent_id;

	var query = 'SELECT code.id, code.name, code.type FROM user, code '
				+ 'WHERE user.id = code.user_id AND user.account = "' + account + '" AND code.parent = "' + pre + '";';
	connection.query(query, function(error, result, fields) {
		if (error) {
			return res.status(400).end();
		}
		return res.json(JSON.stringify(result));
	});
};

exports.downloadFile = function (req, res) {
	var account = getSession.getAccount(req);
	var code_id = req.body["code_id"];
	
	var query = 'SELECT code.path, code.type, code.name FROM user, code '
				+ 'WHERE user.id = code.user_id AND user.account = "' + account + '" AND code.id = "' + code_id + '";';
	connection.query(query, function(error, result, fields) {
		if (error || result.length != 1 || result[0].type == 0) {
			return res.status(400).send('Bad Request');
		}

		var output = result[0].name + "." + result[0].path.split(".")[1];
		return res.download(result[0].path, output);
	});
};
