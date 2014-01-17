 var socket = io.connect('http://localhost');
 var loadedFileName;
 var messages = [];
 var field = document.getElementById("field");
 var sendButton = document.getElementById("send");
 var content = document.getElementById("content");
 var name = document.getElementById("name");

 window.onload = function () {
     socket.on('message', function (data) {
         if (data.message) {
             messages.push(data);
             var html = '';
             for (var i = 0; i < messages.length; i++) {
                 html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                 html += messages[i].message + '<br />';
             }
             content.innerHTML = html;
             $('#content').scrollTop($('#content')[0].scrollHeight);
         } else {
             console.log("There is a problem:", data);
         }
     });

     sendButton.onclick = function () {
         sendMessage();
     };

     $("#field").keyup(function (e) {
         if (e.keyCode == 13) {
             sendMessage();
         }
     });
 }


 function sendMessage() {
     if (name.value == "") {
         alert("Please type your name!");
     } else if (field.value == "") {
         alert("Please type a message!");
     } else {
         var text = field.value;
         socket.emit('send', {
             message: text,
             username: name.value
         });
         field.value = "";
     }
 };

 $(document).ready(function () {
     $('#filetree').fileTree({
         root: 'editableFiles',
         script: 'jqueryFileTree/connectors/jqueryFileTree.asp'
     }, function (file) {
         alert(file);
     });
 });

 function fileLoader(fileName) {
     loadedFileName = fileName;
     socket.emit('fileLoad', {
         message: fileName
     });
 }

 function preview(file) {
     var html = $.parseHTML(file, document, true);
     $('[name="preview"]').contents().find("html").html(html);
 }

 socket.on('fileData', function (data) {
     editor.setValue(data.message);
     preview(data.message);
 });

 var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
     mode: "application/xml",
     styleActiveLine: true,
     lineNumbers: true,
     lineWrapping: true,
     theme: 'monokai'
 });
 editor.on('change', function (cMirror) {
     var fileData = editor.getValue();
     preview(fileData);
     socket.emit('fileChanged', {
         message: fileData
     });
 });

 