
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var filetest = require('./routes/filetest');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var fs = require('fs');
var app = express();
var util = require('util');
var connect = require('connect');
var cookie = require('cookie');

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
app.use(express.session({secret: 'secret', key: 'express.sid'}));
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));
var authentication = app.use(express.basicAuth(function(user, pass){
    if(checkUser(user) && checkPass(pass)){
        return true;
    }
}));

function checkUser(user){
    for(var i = 0; i <users.length; i++){
        if(user == users[i]){
            return true;
        }
    }
}

function checkPass(pass){
    for (var i = 0; i<passwords.length; i++){
        if(pass == passwords[i]){
            return true;
        }
    }
}

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/users/:id', user.list);
app.get('/filetest', authentication , function(req, res){
    console.log("USER IS " + req.user);
    res.render('filetest.ejs');  
});

var credentials;
var users = [];
var passwords = [];
fs.readFile(__dirname + "/logindata.txt", "utf8", function(err,data){
    credentials = data.split(",");
    for(var i = 0; i < credentials.length; i++){
        if(i%2 == 0){
            users.push(credentials[i]);
        }else{
            passwords.push(credentials[i]);
        }
    }
});

var stringHeader = "<ul class='jqueryFileTree' style='display: none;'>";
var stringFooter = "</ul>";
// arguments: path, directory name
var formatDirectory =
        "<li class='directory collapsed'><a href='#' rel='%s/'>%s</a><li>";
// arguments: extension, path, filename
var formatFile = "<li class='file ext_%s'><a href='#' rel='%s'>%s</a></li>";
 
var createStatCallback = (function(res, path, fileName, isLast){
        return function(err, stats){
       
                          if(stats.isDirectory())
                            {
                                res.write(util.format(formatDirectory, path, fileName));
                            }
                            else
                            {
                                var fileExt = fileName.slice(fileName.lastIndexOf('.')+1);
       
                                res.write(util.format(formatFile, fileExt, path, fileName));
                            }
 
                    if(isLast){
                        res.end(stringFooter);
                    }
                }
});


app.post('/', function(req,res){
    // 'text/html'
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write(stringHeader);
 
        // get a list of files
        fs.readdir(__dirname + '/public/editableFiles/', function(err, files){
       
                for(var i = 0; i < files.length; i++)
                {
                        var fileName = files[i];
                        var path = util.format('%s%s', __dirname + '/public/editableFiles/', fileName);
                        var isLast = (i === (files.length-1));
 
 
                        var statCallback = createStatCallback(res, path, fileName, isLast);
 
                        fs.stat(path, statCallback);
            }
 
        });
});


var server = http.createServer(app).listen(app.get('port'), function () {
    console.info('Express server listening on port ' + app.get('port'));
});


var sio = io.listen(server);


sio.sockets.on('connection', function (socket) {
    console.info('   [info] A socket with sessionID ' + socket.handshake.sessionID + ' connected!');
    socket.emit('message', { message: 'Welcome to the chat!' });
    socket.on('send', function (data) {
        sio.sockets.emit('message', data);
    });

    // socket.on('login', function(data){
    //     var creds = data.message.split(",");
    //     var user = creds[0];
    //     var pass = creds[1];
    //     for(var i = 0; i < credentials.length-1; i++){
    //         if(user == credentials[i] && pass == credentials[i]){
    //             redirect = true;
    //         }
    //     }
    //     if(redirect){
    //         socket.emit('readyToRedirect');
    //     }else{
    //         socket.emit('incorrectCreds');
    //     }    
    // });

    // socket.on('logout', function(){
    //     redirect = false;
    // });

    socket.on('fileLoad', function (data) {
        filePath = data.message;
        fileNameArray = filePath.split("/");
        fileName = fileNameArray[fileNameArray.length-1];
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
    socket.on('createFile', function (data){
    	fs.writeFile('public/editableFiles/' + data.message, "",function (err) {
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
