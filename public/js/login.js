window.onload = function(){

	var socket = io.connect(location.hostname);
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