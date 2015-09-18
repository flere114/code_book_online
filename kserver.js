var express = require("express");
var register = require("./routes/register");
var home = require("./routes/home");
var editor = require("./routes/editor");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var methodOverride = require("method-override");
var cookieParser = require("cookie-parser");
var http = require("http");
var path = require("path");
var partials = require("express-partials");
var app = express();

app.set('port',process.env.PORT || 8888);  // set port 3000
app.set('views',path.join(__dirname,'views')); // the directory of views is at __dirname/views/
app.set('view engine','ejs');  // use ejs as view engine

app.use(partials());
//app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(cookieParser()); // ?
app.use(express.static(path.join(__dirname,'public'))); // static file, such as css

// routes
app.get('/',register.regPage);
app.post('/register',register.doReg);
app.post('/login',register.doLogin);
app.get('/home',home.home);
app.get('/editor', editor.editor);

http.createServer(app).listen(app.get('port'),function(req,res){
	console.log('server start at port : %d',app.get('port'));
});
