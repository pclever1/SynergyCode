
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

// all environments
app.set('port', process.env.PORT || 135);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('youre being watched'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/filetest', filetest.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var sio = io.listen(server);

var connect = require('connect');
 


sio.sockets.on('connection', function (socket) {
    console.log('A socket with sessionID ' + socket.handshake.sessionID 
        + ' connected!');
  socket.emit('message', { message: 'hello' });
        socket.on('fileLoad', function(data){
                fileName = data.message;
                fs.readFile(__dirname + '/public/' + data.message , "utf8" , function(err,data){
                        if(err){
                                throw err;
                        }
                        socket.emit('fileData', {message: data});
                });
        });        
        socket.on('fileChanged', function(data){
                console.log('FILE CHANGED ON SERVER SIDE');
                fs.writeFile('public/' + fileName, data.message, function(err){
                        if(err){
                                throw err;
                        }
                        console.log("THE FILE WAS SAVED");
                });
        });
});