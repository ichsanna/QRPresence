const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const mongodb = require('express-mongo-db')
const mongourl = "mongodb://user:password1@ds235078.mlab.com:35078/hahihu"

var app = express();

// view engine setup
app.use(express.static(__dirname + '/views'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(mongodb(mongourl));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  if (err.status == 404) res.render('error', {
    message: err.message,
    error: {}
  });
  else res.redirect('/');
});

module.exports = app;
