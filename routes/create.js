var sys = require('sys');
var exec = require('child_process').exec;
var getSession = require('./getSession');
var server = require('./serverConfig');
var tree = require('./tree');
var fs = require('fs');
var connection = server.open();

createCodeFunc = function (req, res, user_id, copy_num) {
	var account = getSession.getAccountNoTime(req);

	var name = req.body["codeName"];
	if (name === "") {
		name = "Unknown";
	}
	if (copy_num !== 0) {
		name += "(" + copy_num + ")";
	}
	var pre = req.body["parent_code_ID"];
	var type = req.body["codeType"];
	var extension = server.codeType[type].type;
	var date = new Date();
	var path = "/var/www/code/" + date.getFullYear() + date.getMonth() + date.getDate() 
			+ date.getHours() + date.getMinutes() + date.getSeconds()
			+ "-" + account + "-" + name + extension;
	var verify = user_id + "-" + pre + "-" + name + "-" + type;

	var query = 'INSERT INTO code (id, name, user_id, parent, type, path, verify) '
		 	+ 'VALUES (NULL, "' + name + '", "' + user_id + '", "' + pre + '", "' + type + '", "' + path + '", "' + verify + '");';
		 			+ 'VALUES (NULL, "' + name + '", "' + user_id + '", "' + pre + '", "' + type + '", "' + path + '", "' + verify + '");';
	connection.query(query, function(error, result, fields) {
		if (error) {
			createCodeFunc(req, res, user_id, copy_num+1);
			return;
		}

		var code = req.body["codeArea"];
		fs.writeFile(path, code, function(err) {});
		return res.redirect("/home");
	});
};

exports.createCode = function (req, res) {
	var account = getSession.getAccount(req);
	var query = 'SELECT vid, id FROM user WHERE account = "' + account + '";';
	
	connection.query(query, function(error, result, fields) {
		if (error || result.length == 0) {
			return res.redirect("/");  // render send error
		}

		var user_id = result[0].id;
		var pre = req.body["parent_code_ID"];
		
		var query = 'SELECT type FROM code WHERE user_id = "' + user_id + '" AND id = "' + pre + '";';
		connection.query(query, function(error, result, fields) {
			if (error || result.length != 1 || result[0].type != 0) {
			// 判斷 parent 是否為資料夾 
				return res.status(400).end();
			}
			createCodeFunc(req, res, user_id, 0);
		});
	});
};

createFolderFunc = function (req, res, user_id, copy_num) {
	var name = req.body.folderName;
	if (name === "") {
		name = "Unknown";
	}
	if (copy_num !== 0) {
		name += "(" + copy_num + ")";
	}
	var pre = req.body.parent_id;
	var type = "0";
	var verify = user_id + "-" + pre + "-" + name + "-" + type;

	var query = 'INSERT INTO code (id, name, user_id, parent, type, verify) '
			+ 'VALUES (NULL, "' + name + '", "' + user_id + '", "' + pre + '", "' + type + '", "' + verify + '");';
	connection.query(query, function(error, result, fields) {
		if (error) {
			createFolderFunc(req, res, user_id, copy_num+1);
			return;
		}
			
		var query = 'SELECT id,name,type,parent FROM code WHERE user_id = "' + user_id + '";';
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

exports.createFolder = function (req, res) {
	var account = getSession.getAccount(req);
	var query = 'SELECT id FROM user WHERE account = "' + account + '";';

	connection.query(query, function(error, result, fields) {
		if (error || result.length == 0) {
			return res.status(400).end();
			//return res.redirect("/");
		}

		var user_id = result[0].id;
		var pre = req.body.parent_id;
		
		var query = 'SELECT type FROM code WHERE user_id = "' + user_id + '" AND id = "' + pre + '";';
		connection.query(query, function(error, result, fields) {
			if (error || result.length == 0 || result[0].type != 0) {
			// 判斷 parent 是否為資料夾 
				return res.status(400).end();
			}
			createFolderFunc(req, res, user_id, 0);
		});
	});
};

createCodebookFunc = function(req, res, user_id, pre, copy_num, latexPath, newCodebook) {
	var account = getSession.getAccountNoTime(req);

	var name = req.body.CodebookName;
	if (copy_num !== 0) {
		name += "(" + copy_num + ")";
	}
	var date = new Date();
	var path = "/var/www/code/" + date.getFullYear() + date.getMonth() + date.getDate() 
		+ date.getHours() + date.getMinutes() + date.getSeconds()
		+ "-" + account + "-" + name + ".pdf";
	var type = "100";
	var verify = user_id + "-" + pre + "-" + name + "-" + type;

	query = 'INSERT INTO code (id, name, user_id, parent, type, path, verify) '
		+ 'VALUES (NULL, "' + name + '", "' + user_id + '", "' + pre + '", "' + type + '", "' + path + '", "' + verify + '");';
	connection.query(query, function(error, result, fields) {
		if (error) {
			createCodebookFunc(req, res, user_id, pre, copy_num+1, latexPath, newCodebook);
			return;
		} else {
			fs.mkdirSync(latexPath);
			fs.writeFileSync(latexPath+name+".tex", newCodebook);
			exec("sh script/compileLatex.sh " + latexPath + " " + name.replace("(", "\\(").replace(")","\\)") 
					+ " " + path.replace("(", "\\(").replace(")", "\\)"), function(error, stdout, stderr) {
				return res.status(200).send('OK!');
			});
		}
	});
};

exports.createCodebook = function (req, res) {
	console.log("create Codebook");
	var account = getSession.getAccount(req);
	var query = 'SELECT id, vid FROM user WHERE account = "' + account + '";';
	
	connection.query(query, function(error, result, fields) {
		if (error || result.length == 0) {
			return;
		}
		
		var user_id = result[0].id;
		var pre = result[0].vid;
		
		var name = req.body.CodebookName;
		var content = req.body.Content;

		var code = [];
		for (var i = 0; i < content.length; i++) {
			for (var j = 0; j < content[i].Code.length; j++) {
				code.push(content[i].Code[j]);
			}
		}
		//console.log(name);
		//console.log(content);
		//console.log(code);

		if (code.length == 0) {
			return res.status(400).send('Bad Request');
		}

		var query = 'SELECT name, path, id FROM code WHERE user_id = "' + user_id + '" AND type != "0" AND type != "100" AND (';
		for (var i = 0; i < code.length; i++) {
			if (i != 0)
				query += ' OR ';
			query += 'id = "' + code[i] + '"';
		}
		query += ');';
		//console.log(query);

		connection.query(query, function(error, result, fields) {
			if (error || result.length == 0) {
				console.log(error);
				return res.status(400).end();
			}

			//console.log(result);
			var codeAttr={};
			for (var i = 0; i < result.length; i++) {
				codeAttr[result[i].id] = {"name" : result[i].name, "path" : result[i].path};
			}

			//console.log(codeAttr);
			fs.readFile("/var/www/latex/header.txt", 'utf8', function(error, data) {
				if (error) {
					console.log(error);
					return res.status(400).end();
				}

				var newCodebook = data;
				newCodebook += "\\begin{document}\n\\begin{multicols}{2}\n\\thispagestyle{fancy}\n\n";

				for (var i = 0; i < content.length; i++) {
					if (content[i].Name != "Root")
						newCodebook += "\t\\section{" + content[i].Name + "}\n";
					for (var j = 0; j < content[i].Code.length; j++) {
						var codePath = codeAttr[content[i].Code[j]].path;
						var codeName = codePath.split("/");
						newCodebook += "\t\t\\includecpp{" + codeAttr[content[i].Code[j]].name + "}" + "{/var/www/code}{" + codeName[4] + "}\n";
					}
					newCodebook += "\n";
				}

				newCodebook += "\\enlargethispage*{\\baselineskip}\n\\pagebreak\n\\end{multicols}\n\\end{document}";

				var date = new Date();
				var latexPath = "/var/www/latex/" + date.getFullYear() + date.getMonth() + date.getDate() 
					+ date.getHours() + date.getMinutes() + date.getSeconds()
					+ "-" + account + "/";
				createCodebookFunc(req, res, user_id, pre, 0, latexPath, newCodebook); 
			});
		});
	});
};
