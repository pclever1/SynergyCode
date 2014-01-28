//Authorization
var socket = io.connect(location.hostname);
socket.on('error', function (reason) {
    console.error('Unable to connect Socket.IO', reason);
});

socket.on('connect', function (data) {
    console.info('successfully established a working and authorized connection');
});

window.onload = function(){
	var user = document.getElementById("user");
    var submit = document.getElementById("sub");
    var pass = document.getElementById("pass");

   	submit.onclick = function(){
   		checkCredentials();
   	};

   	function checkCredentials(){
   		var creds;
   		if(user.value == ""){
   			alert("Please enter your username.");
   		}else if(pass.value == ""){
   			alert("Please enter your password");
   		}else{
   			creds = user.value.concat(",", pass.value);
   			socket.emit('login', {message: creds});
   		}
   	}

   	socket.on('readyToRedirect', function(){
   		window.location.href = "/filetest";
   	});

   	socket.on('incorrectCreds', function(){
   		alert("Either your username or password is incorrect.");
   	});
}   	
