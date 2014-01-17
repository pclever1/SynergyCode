window.onload = function() {
 
    var messages = [];
    var socket = io.connect(location.hostname);
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");
 
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';

                html += messages[i].message.replace(/(<([^>]+)>)/ig,"") + '<br />';
            }
            content.innerHTML = html;
            
            emojify.run(document.getElementById("chat"));
            $('#content').scrollTop($('#content')[0].scrollHeight);
        } else {
            console.log("There is a problem:", data);
        }
    });
 
    sendButton.onclick = function() {
        sendMessage();
    };
    sendMessage = function() {
        if(name.value == "") {
            alert("Please type your name!");
        } else if(field.value == ""){
            alert("Please type a message!");
        }else{
            var text = field.value;
            socket.emit('send', { message: text, username: name.value });
            field.value = "";
        }
    };
jQuery.fn.stripTags = function() { return this.replaceWith( this.html().replace(/<\/?[^>]+>/gi, '') ); };
}
$(document).ready(function() {
    $("#field").keyup(function(e) {
        if(e.keyCode == 13) {
            sendMessage();
        }
    });
    emojify.setConfig({
        emoticons_enabled: true,
        people_enabled: true,
        nature_enabled: true,
        objects_enabled: true,
        places_enabled: true,
        symbols_enabled: true
    });
});
