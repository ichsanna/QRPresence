const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const webroutes = require('./routes/web');
const apiroutes = require('./routes/api')
const mongodb = require('express-mongo-db')
const passport = require('passport');
const session = require('express-session')
const mongourl = "mongodb+srv://admin:admin@cluster0.rp09c.mongodb.net/haha?retryWrites=true&w=majority"


const app = express();

// view engine setup
// app.use(express.static(__dirname + '/views'));
// app.engine('ejs', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Passport initialization
app.use(session({
  secret: "C4nY0uR34dTh1S",
  resave: true,
  saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(mongodb(mongourl));
app.use('/', webroutes);
app.use('/api/',apiroutes);

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
