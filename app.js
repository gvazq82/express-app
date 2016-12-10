var express = require('express');
var exphbs  = require('express-handlebars'); //ADD THIS
var sassMiddleware = require('node-sass-middleware'); // ADD THIS
var browserify = require('browserify-middleware'); //ADD THIS
var mongoose = require('mongoose');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var todos = require('./routes/todos/index'); //ADD THIS LINE
var todosAPI = require('./routes/todos/api');


var app = express();

// view engine setup
app.engine('hbs', exphbs({extname: '.hbs', defaultLayout: 'layout'}));
app.set('view engine', 'hbs');
//SASS
app.use (
  sassMiddleware({
    src: __dirname + '/sass',
    dest: __dirname + '/public',
    // prefix: '/stylesheets',
    debug: true
  })
);
//ADD THE CODE BELOW
browserify.settings({
  transform: ['hbsfy']
});
// Browserify
app.get('/javascripts/bundle.js', browserify('./client/script.js'));

// MONGO DB
mongoose.connect('mongodb://localhost/todos');

// Browsersync
if (app.get('env') == 'development') {
  var browserSync = require('browser-sync');
  var config = {
    files: ["public/**/*.{js,css}", "client/*.js", "sass/**/*.scss", "views/**/*.hbs"],
    logLevel: 'debug',
    logSnippet: false,
    reloadDelay: 3000,
    reloadOnRestart: true
  };
  var bs = browserSync(config);
  app.use(require('connect-browser-sync')(bs));
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/bootstrap-sass/assets/fonts'))); // ADD THIS


app.use('/', index);
app.use('/users', users);
app.use('/todos', todos); //ADD THIS LINE
app.use('/api/todos', todosAPI);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
