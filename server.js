var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();

http.createServer(function(request, response){
	fs.readFile('./public/index.html', function(err, html){
		if(err){
			throw err;
		}
		response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
		response.end();
	});
}).listen(8124);

var htmldata;

fs.readFile('./public/create.html', "utf-8",function(error, data){
	if(error){
		throw error;
	}
	htmldata = data;
});

app.get('/user/:id', function(req, res) {
    res.send('user ' + req.params.id);
});

console.log('Server running at http://127.0.0.1:8124/');