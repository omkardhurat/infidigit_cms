var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var configRouter = require('./routes/config');
var channel = require('./routes/channel');
var network = require('./routes/network');
var compaign = require('./routes/compaign');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'cms',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));

function isLoggedIn(req, res, next) {
  console.log("session check");
  if (req.session && req.session.user) {
    console.log("session in");
    next(); // Allow access to the route if logged in
  } else {
    console.log("ses out");
    return res.redirect(`/?error=Session Timeout`);
  }
}

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/config', configRouter);
app.use('/channel', channel);
app.use('/network', network);
app.use('/compaign', compaign);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
global.userSession = {};

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
