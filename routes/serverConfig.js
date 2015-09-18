var mysql = require('mysql');

exports.open = function() {
	return mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : '',
		database : 'codebook'
	});
}

var codeType = [];
codeType[1] = 	{"type" : ".cpp",	"mode" : "text/x-c++src"};
codeType[2] = 	{"type" : ".java",	"mode" : "text/x-java"};
codeType[3] = 	{"type" : ".py",	"mode" : "text/x-python"};
codeType[100] = {"type" : ".pdf",	"mode" : ""};

exports.codeType = codeType;
