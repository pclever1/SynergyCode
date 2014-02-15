//Authorization
var socket = io.connect(location.hostname);
socket.on('error', function (reason) {
    console.error('DEBUG: Unable to connect Socket.IO', reason);
});

socket.on('connect', function (data) {
    console.info('DEBUG: Successfully established a working and authorized connection');
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

function initCodemirror(id){
    var cm = CodeMirror.fromTextArea(id, {
        mode: "application/xml",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        theme: 'monokai'
    });
    return cm;
}

var editor = initCodemirror(document.getElementById('editor'));

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

$('#chatOpener').on("click", function (e) {
    if(!chatOpen){
        $('#draggable').show();
        $('#chatOpener').text('Close Chat');
        chatOpen = true;
    }else if(chatOpen){
        $('#draggable').hide();
        $('#chatOpener').text('Open Chat');
        chatOpen = false;
    }
});

//makes chat draggable
$('#draggable').draggable();

//open sharejs session
sharejs.open('hello', 'text', function(error, doc) {
    doc.attach_cm(editor);
});