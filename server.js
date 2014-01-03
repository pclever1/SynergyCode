var http = require('http');
var fs = require('fs');

var svr = http.createServer(function(req, resp) {
  fs.readFile(__dirname + '/public/index.html', function (err, data) {
    if (err) {
      resp.writeHead(500);
      return resp.end('Error loading html page');
    }
	resp.writeHead(200, { 'Content-Type': 'text/html' });
	resp.end(data);
	});
});

var io = require('socket.io').listen(svr);

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'hello' });
   // socket.on('send', function (data) {
     //   io.sockets.emit('message', data);
    //});
	socket.on('fileLoad', function(data){
		console.log(data.message);
		fs.readFile(__dirname + '/public/' + data.message , "utf8" , function(err,data){
			if(err){
				resp.writeHead(500);
				return resp.end('Error loading html page');
			}
			io.sockets.emit('fileData', {message: data});
		});
	});	
});


svr.listen(80, function() {
  console.log('The server is listening on port 80');
});