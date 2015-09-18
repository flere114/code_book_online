var server = require('./serverConfig.js');
var getSession = require('./getSession');

var connection = server.open();
var edge,hash,data,root;
var mode;

var genTree = function(x){
	var ret = '';
	if(data[x].type!=0){  // not a directory
		if(mode==0){
			if (data[x].type==100)
				return '<li onclick="choosePDF(' + data[x].id + ')"><span class="file efile" id="f' + data[x].id + '">'
				+ data[x].name + '</span></li>';
			else
				return '<li onclick="chooseCode(' + data[x].id + ')"><span class="file efile" id="f' + data[x].id + '">'
				+ data[x].name + '</span></li>';
	//	} else if(mode==1) {
	//		if(data[x].type!=100)
	//			return '<li onclick="getFile(' + data[x].id +')"><span class="file efile">' + data[x].name + '</span></li>';
	//		else
	//			return '<li><span class="file">' + data[x].name + '</span></li>';
		} else if(mode==2) {
			return '<li><span class="file">' + data[x].name + '</span></li>';
		}
	}
	if(x==root){  // root default open
	/*	if(mode==1){
			ret += '<ul id="browser" class="filetree">' +
			'<li><span class="folder">' + data[x].name + '</span>' +
			'<ul>';
		}else*/ if(mode==2){
			
			ret += '<ul id="browser" class="filetree">' +
			'<li><span class="folder" onclick="getObjects('+data[x].id+')" id="f' + data[x].id + '">/root</span>' +
			'<ul>';
		}else if(mode==0){
			ret += '<ul id="browser" class="filetree">' +
			'<li><span class="folder" onclick="chooseFolder('+data[x].id+')" id="f' + data[x].id + '">/root</span>' +
			'<ul id="c' + data[x].id + '">';
		}
	}else{	// else default close
		/*if(mode==1){
			ret += '<li class="closed"><span class="folder">' + data[x].name + '</span>' +
			'<ul>';
		}else*/ if(mode==2){
			ret += '<li class="closed"><span class="folder" onclick="getObjects('+data[x].id+')" id="f' + data[x].id + '">'
			+data[x].name+'</span>'+
			'<ul>';
		}else if(mode==0){
			ret += '<li class="closed"><span class="folder" onclick="chooseFolder('+data[x].id+')" id="f' + data[x].id + '">'
			+data[x].name+'</span>'+
			'<ul id="c' + data[x].id + '">';
		}
	}	
	for(var i=0;i<edge[x].length;i++){
		ret += genTree(edge[x][i]);
	}
	if(x==root){
		ret += '</ul></li></ul>';
	}else{
		ret += '</ul></li>';
	}
	return ret;
};

function sortByName(a,b){
	var c=a.name.toLowerCase(), d=b.name.toLowerCase();
	return c < d ? -1 : 1;
};
exports.rebuildTree = function(vid,result){
	mode = 0;
	data = result;
	data.sort(sortByName);
	hash = new Object();
	for(var i=0;i<data.length;i++)
		hash[data[i].id] = i;
	edge = new Array(data.length);
	for(var i=0;i<data.length;i++)
		edge[i] = new Array();	
	for(var i=0;i<data.length;i++)
		if(data[i].parent!=-1)
			edge[hash[data[i].parent]].push(i);
	root = hash[vid];
	var now = genTree(hash[vid]), ret = '';
	for(var i=0;i<now.length;i++){
		if(now.charAt(i)=='"')	ret += '\\' + '"';
		else	ret += now[i];
	}
	return ret;
}
exports.genHTML = function(req,res,theme,replace){
	var account = getSession.getAccountNoTime(req);
	var q = 'select * from user where account = "' + account + '";';
	connection.query(q,function(error,result,fields){
		if(error){
			console.log('error happened at tree.js, query = ' + q);
			throw error;
		}
		console.log('account = ' + account);
		if(result.length == 0){
			res.status(400).send('Bad Request');
			res.end();
			return;
		}
		var vid = result[0].vid;
		q = 'select name,parent,id,type from code where user_id = "' + result[0].id + '";';
		connection.query(q,function(error,result,fields){
			if(error){
				console.log('error happened at tree.js, query = ' + q);
			}
			if(theme == 'home')	mode = 0;
			//else if(theme =='editor')	mode = 1;
			else if(theme =='codebook') mode = 2;
			data = result;
			data.sort(sortByName);
			hash = new Object();
			for(var i=0;i<data.length;i++)
				hash[data[i].id] = i;
			edge = new Array(data.length);
			for(var i=0;i<data.length;i++)
				edge[i] = new Array();	
			for(var i=0;i<data.length;i++)
				if(data[i].parent!=-1)
					edge[hash[data[i].parent]].push(i);
			root = hash[vid];
			replace.rootID = vid;
			replace.tree = genTree(hash[vid]);
			res.render(theme,replace);
		});
	});
};
