
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , Server = require('./routes/Server')
  , http = require('http')
  , path = require('path');

var passport = require('passport');
var mongoConnectURL = "mongodb://localhost:27017/Releaf";
var mongo = require("./routes/mongo");
var session = require("express-session");
var mongoStore = require("connect-mongo")(session);

var app = express();
app.use(session({
  secret: "Releaf",
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 6 * 1000,
  saveUninitialized: false,
  resave: false,
  store: new mongoStore({ url: 'mongodb://localhost:27017/Releaf' })
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.use(passport.initialize());
require('./routes/passport')(passport);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//GET APIs
app.get('/', routes.index);
app.get('/signUp', Server.signUp);
app.get('/login', Server.login);
app.get('/logout', Server.logout);
app.get('/userRetrieveCompanyDetails', Server.userRetrieveCompanyDetails);
app.get('/userRetrieveCmpnyDtlsRankWise', Server.userRetrieveCmpnyDtlsRankWise);

//POST APIs
app.post('/adminAddCompany', Server.adminAddCompany);
app.post('/adminRemoveCompany', Server.adminRemoveCompany);
app.post('/adminUpdateCompany', Server.adminUpdateCompany);


mongo.connect(mongoConnectURL, function(){
  console.log('Connected to mongo at: ' + mongoConnectURL);
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });  
});
