'use strict';

//dependencies
var config = require('./config'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    csrf = require('csurf'),
    schedule = require('node-schedule'),
    https = require('https'),
    fs = require('fs');


//create express app
var app = express();

//keep reference to config
app.config = config;

//setup the web server
var options = {
  key: fs.readFileSync('./privatekey.pem', 'utf8'),
  cert: fs.readFileSync('./server.crt', 'utf8')
};
app.httpServer = http.createServer(app);
app.httpsServer = https.createServer(options,app);


//setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  console.log("Database connected");
});

//config data models
require('./models')(app, mongoose);

//settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('serve-static')(path.join(__dirname, 'client/dist')));
app.use(require('serve-static')(path.join(__dirname, 'client/img')));

app.use(require('method-override')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cryptoKey));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({ cookie: { signed: true } }));
helmet(app);

//response locals
app.use(function(req, res, next) {
  res.cookie('_csrfToken', req.csrfToken());
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  next();
});

//global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

//setup passport
require('./passport')(app, passport);

//setup utilities
app.utility = {};
app.utility.sendmail = require('./util/sendmail');
app.utility.slugify = require('./util/slugify');
app.utility.workflow = require('./util/workflow');
app.utility.multer  = require('multer');
app.utility.upload = app.utility.multer({ dest: './client/img/' });

//setup routes
require('./routes')(app, passport);

//setup jobs
require('./jobs')(app, schedule);

//custom (friendly) error handler
app.use(require('./service/http').http500);

//listen up

app.httpsServer.listen(app.config.httpsport, function(){
  console.log("https server running")
});

app.httpServer.listen(app.config.port, function(){
  console.log("http server running")
});
