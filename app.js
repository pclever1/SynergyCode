/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var fs = require('fs');
var app = express();
var util = require('util');
var connect = require('connect');
var cookie = require('cookie');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    username: String,
    password: String,
    account_level: String
});

UserSchema.methods.validPassword = function(pass){
    if(pass == this.password){
        return true;
    }
    return false;
}
var User = mongoose.model('User', UserSchema);
mongoose.connect('mongodb://localhost/mydb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('yay db connection');    
});
var flash = require('connect-flash');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({
    secret: 'secret',
    key: 'express.sid'
}));
 app.use(passport.initialize());
  app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var requiresLogin = function(req, res, next){
    if(!req.isAuthenticated()){
        return res.send(400);
    }
    next();
}

var signout = function(req, res){
    req.logout();
    res.redirect('/');  
}

app.get('/', routes.index);
app.get('/filetest', requiresLogin,function(req, res){
    res.render('filetest.ejs', {title: 'Synergy Code'});  
});
app.get('/logout', signout);
app.get('/create', requiresLogin, function(req,res){
    res.render('createFile.ejs');
});


var stringHeader = "<ul class='jqueryFileTree' style='display: none;'>";
var stringFooter = "</ul>";
// arguments: path, directory name
var formatDirectory =
    "<li class='directory collapsed'><a href='#' rel='%s/'>%s</a><li>";
// arguments: extension, path, filename
var formatFile = "<li class='file ext_%s'><a href='#' rel='%s'>%s</a></li>";

var createStatCallback = (function (res, path, fileName, isLast) {
    return function (err, stats) {

        if (stats.isDirectory()) {
            res.write(util.format(formatDirectory, path, fileName));
        } else {
            var fileExt = fileName.slice(fileName.lastIndexOf('.') + 1);

            res.write(util.format(formatFile, fileExt, path, fileName));
        }

        if (isLast) {
            res.end(stringFooter);
        }
    }
});


app.post('/', function (req, res) {
    // 'text/html'
    res.writeHead(200, {
        'content-type': 'text/plain'
    });
    res.write(stringHeader);

    // get a list of files
    fs.readdir(__dirname + '/public/editableFiles/', function (err, files) {

        for (var i = 0; i < files.length; i++) {
            var fileName = files[i];
            var path = util.format('%s%s', __dirname + '/public/editableFiles/', fileName);
            var isLast = (i === (files.length - 1));


            var statCallback = createStatCallback(res, path, fileName, isLast);

            fs.stat(path, statCallback);
        }

    });
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/filetest',
        failureRedirect: '/',
        failureFlash: true
    })
);


var server = http.createServer(app).listen(app.get('port'), function () {
    console.info('Express server listening on port ' + app.get('port'));
});

passport.use(new LocalStrategy(function(username, password, done){
    User.findOne({username:username}, function(err, user){
        if(err){
            console.log('dead at first if');
            return done(err);
        }
        if(!user){
            console.log('dead at incorrect user');
            console.log(user);
            return done(null, false, {message: 'Incorrect username.'});
        }
        if(!user.validPassword(password)){
            console.log('dead at incorrect pass');
            return done(null, false, {message: 'Incorrect password.'});
        }
        console.log('got to end, successful, should redirect');
        return done(null,user);
    });
}));

passport.serializeUser(function(user,done){
    done(null, user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id, function(err,user){
        done(err,user);
    });
});

var sio = io.listen(server);

sio.sockets.on('connection', function (socket) {
    socket.emit('message', {
        message: 'Welcome to the chat!'
    });
    socket.on('send', function (data) {
        sio.sockets.emit('message', data);
    });

    socket.on('fileLoad', function (data) {
        filePath = data.message;
        fileNameArray = filePath.split("/");
        fileName = fileNameArray[fileNameArray.length - 1];
        console.log(fileName);
        fs.readFile(__dirname + '/public/editableFiles/' + fileName, "utf8", function (err, data) {
            if (err) {
                console.log(err);
                throw err;
            }
            socket.emit('fileData', {
                message: data
            });
        });
    });
    socket.on('fileChanged', function (data) {
        fs.writeFile('public/editableFiles/' + fileName, data.message, function (err) {
            if (err) {
                throw err;
            }
        });
    });
    socket.on('createFile', function (data) {
        fs.writeFile('public/editableFiles/' + data.message, "", function (err) {
            if (err) {
                throw err;
            }
        });
    });
});

sio.set('authorization', function (handshakeData, accept) {

    if (handshakeData.headers.cookie) {

        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

        handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');

        if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
            return accept('Cookie is invalid.', false);
        }

    } else {
        return accept('No cookie transmitted.', false);
    }

    accept(null, true);
});
