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

//function initializes code mirror
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


var editor = initCodemirror(document.getElementById('editor'));   //holds the instance of codemirror
var connection = new sharejs.Connection();      //this variable keeps track of the sharejs connection
var fileData;       //this variable holds the file data received when a user tries to open up a file

//tells server to load file, sets up the sharejs connection if necessary
function fileLoader(filePath) {
    //emits message to server telling server to deliver a particular file
    socket.emit('fileLoad', {
        message: filePath
    });

    //this block of code splits the file path passed in to obtain only the file name without any extension
    var fileNameArray = filePath.split("/");
    var fileNameWithExt = fileNameArray[fileNameArray.length - 1];
    fileNameArray = fileNameWithExt.split(".");
    fileName = fileNameArray[0];

    //disconnects the previous sharejs session in order to prevent any text mismatches and allow different people to edit different files if necessary 
    console.info('DEBUG: Connection Disconnected');
    connection.disconnect();

    // opens a new sharejs connection with the current file name as the document name
    // This allows people to concurrently edit files when they are on the same file, but will allow them 
    // to edit different files if necessary
    connection = new sharejs.Connection();
    connection.open(fileName, 'text', function(error, doc) {
        doc.attach_cm(editor);
        console.info('doc opened');
        editor.setValue(fileData);
    });
    console.info('DEBUG: Connection Opened');
}

//function loads up the live preview of the code being developed
function preview(file) {
    var html = $.parseHTML(file, document, true);
    $('[name="preview"]').contents().find("html").html(html);
}

//sets filedata variable equal to the retrieved file data
//also activates the preview
socket.on('fileData', function (data) {
    fileData = data.message;
    console.info('DEBUG: Filedata Received On Front End');
    preview(data.message);
});

//allows user to open and close the preview
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

//updates preview and saves file when the file contents are changed
editor.on('change', function (op) {
    var fileData = editor.getValue();
    preview(fileData);
    socket.emit('fileChanged', {
        message: fileData
    });
    console.info('change event on front side');
});

//sets width of editor
$(document).ready(function () {
    $('#editor').css("width", screen.width / 2);
});

//prevents chat from using html
jQuery.fn.stripTags = function () {
    return this.replaceWith(this.html().replace(/<\/?[^>]+>/gi, ''));
};

//this block of code allows users to open and close the chat
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