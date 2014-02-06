//Authorization
var socket = io.connect(location.hostname);
socket.on('error', function (reason) {
    console.error('Unable to connect Socket.IO', reason);
});

socket.on('connect', function (data) {
    console.info('successfully established a working and authorized connection');
});

//filetree structure
$(document).ready(function () {
    $('#filetree').fileTree({
        root: '/editableFiles', 
        script: '/loadFileTree' 
    }, function (file) {
        fileLoader(file);
    });
});

//logout button
// $('#logout').on('click', function () {
//     socket.emit('logout');
// });



//editor
function fileLoader(filePath) {
    socket.emit('fileLoad', {
        message: filePath
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

$(document).ready(function () {
    $('#editor').css("width", screen.width / 2);
});

//chat
jQuery.fn.stripTags = function () {
    return this.replaceWith(this.html().replace(/<\/?[^>]+>/gi, ''));
};
var chatOpen = false;

$('#chatPulloutBar').on("click", function (e) {
    if (!chatOpen) {
        $('#chatContainer').animate({
            "left": "-=20%"
        }, "slow");
        $('#chatPulloutBar').animate({
            "left": "-=20%"
        }, "slow");
        $('#chatPulloutBar img').attr("src", "images/rightArrow.png");
        chatOpen = true;
    } else {
        $('#chatContainer').animate({
            "left": "+=20%"
        }, "slow");
        $('#chatPulloutBar').animate({
            "left": "+=20%"
        }, "slow");
        $('#chatPulloutBar img').attr("src", "images/leftArrow.png");
        chatOpen = false;
    }
    e.stopPropagation();
});