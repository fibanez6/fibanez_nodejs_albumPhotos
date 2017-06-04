var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    expressSession = require('express-session'),
    db = require('./middlewares/db.js'),
    mongo = require('./middlewares/mongo.js'),
    //mongo = require('./middlewares/mongoose.js'),
    auth = require('./middlewares/authentication.js'),
    passport = require('passport'),
    flash = require('connect-flash');
//var multer = require('multer');

var app = express();

var sess = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 2419200000
    }
    //cookie: { secure: true }
}

app.use(function (req, res, next) {
    res.locals.req = req;
    next();
});

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

// Configuring Passport
app.use(expressSession(sess))
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'static')));
//app.use(express.multipart());
app.use(methodOverride());
// parse multipart/form-data
//app.use(multer({dest:'./uploads/'}));

app.all('*', auth.authSession);

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/albums', require('./routes/albums.js'));
app.use('/pages', require('./routes/pages.js'));
app.use('/auth', require('./routes/auth.js') (passport));
app.use('/logout', auth.logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

db.init(function (err, results) {
    if (err) {
        console.error("** FATAL ERROR ON STARTUP MYSQL: ");
        console.error(err);
        process.exit(-1);
    }
});

mongo.init(function (err, results) {
    if (err) {
        console.error("** FATAL ERROR ON STARTUP MONGO: ");
        console.error(err);
        process.exit(-1);
    } else {
        console.log("Mongo Database initialised and connected");
    }
});

module.exports = app;
