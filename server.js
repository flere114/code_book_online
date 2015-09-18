var register = require("./routes/register");
var main = require("./routes/main");
var get = require("./routes/get");
var create = require("./routes/create");
var update = require("./routes/update");
var remove = require("./routes/remove");

var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var methodOverride = require("method-override");
var cookieParser = require("cookie-parser");
var http = require("http");
var path = require("path");
var partials = require("express-partials");
var session = require("express-session");

var app = express();
app.set('port',process.env.PORT || 3000);  		// set port 3000
app.set('views',path.join(__dirname,'views')); 	// the directory of views is at __dirname/views/
app.set('view engine','ejs');  					// use ejs as view engine

app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(cookieParser('123456789')); // ?
app.use(express.static(path.join(__dirname,'public'))); // static file, such as css
app.use(session({secret:"tony-kerker-project"}));
//app.use(morgan('combined'));

// routes
app.get('/',main.regPage);
app.get('/home', main.home);
app.get('/codebook', main.codebook);

app.post('/register',register.doReg);
app.post('/login',register.doLogin);
app.post('/logout',register.doLogout);

app.post('/getCode', get.getCode);
app.post('/getObjects', get.getObjects);
app.post('/downloadFile', get.downloadFile);

app.post('/createCode', create.createCode);
app.post('/createFolder', create.createFolder);
app.post('/createCodebook', create.createCodebook);

app.post('/updateCode', update.updateCode);
app.post('/updateName', update.updateName);
app.post('/updatePath', update.updatePath);

app.post('/removeObject', remove.removeObject);


http.createServer(app).listen(app.get('port'),function(req,res){
	console.log('server start at port : %d',app.get('port'));
});
