var express = require('express')
,	path = require('path')
, favicon = require('serve-favicon')
,	logger = require('morgan')
, compression = require('compression')
, passport = require('passport')
, session = require('express-session')
, cookieParser = require('cookie-parser')
, flash = require('connect-flash')

//Set up mongoose connection
var mongoose = require('mongoose');
var db_url = 'mongodb+srv://<username>:<password>@cluster0.kvowd.mongodb.net/?retryWrites=true&w=majority' 
var mongoDB = process.env.MONGODB_URL || db_url;
mongoose.connect(mongoDB,  {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var indexRouter = require('./routes/index');

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression());
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Set up session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(flash())
app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.err_login = req.flash('err_login');
  next();
});

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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