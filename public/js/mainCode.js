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

var previewDisplayed = true;
function togglePreview(){
    if(previewDisplayed){
        $('[name="preview"]').hide();
        $('#previewToggle').attr('value', 'Show Preview');
        $('#previewHeader').hide();
        editor.setSize("201%", "100%");
        previewDisplayed = false;
    }else{
        $('[name="preview"]').show();
        $('#previewToggle').attr('value', 'Hide Preview');
        $('#previewHeader').show();
        editor.setSize("100%", "100%");
        previewDisplayed = true;
    }
}

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
            "top": "-=35%"
        }, "slow");
        $('#chatPulloutBar').animate({
            "top": "-=35%"
        }, "slow");
        $('#chatPulloutBar img').attr("src", "images/bottomArrow.png");
        chatOpen = true;
    } else {
        $('#chatContainer').animate({
            "top": "+=35%"
        }, "slow");
        $('#chatPulloutBar').animate({
            "top": "+=35%"
        }, "slow");
        $('#chatPulloutBar img').attr("src", "images/topArrow.png");
        chatOpen = false;
    }
    e.stopPropagation();
});