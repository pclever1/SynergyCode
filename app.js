/**
 * Module dependencies.
 **/
var express = require('express'),
    io = require('socket.io'),
    connect = require('connect'),
    pageRouter = require('./routes/pageRouter'),
    http = require('http'),
    fs = require('fs'),
    util = require('util'),
    cookie = require('cookie'),
    passport = require('passport'),
    path = require('path'),
    ObjectID = require('mongodb').ObjectID,
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    app = express(),
    os = require('os'),
    childProcess = require('child_process'),
    ls,
    User,
    db,
    sharejs = require('share').server;

/**
* some middleware setup
**/
app.set('port', process.env.PORT || 3000);       //sets port variable according to PORT global variable; default port=3000
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({
    secret: 'secret',
    key: 'express.sid'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));

/**
* creates the server
**/
var server = http.createServer(app).listen(app.get('port'), function () {
    console.info('DEBUG: Server listening on port ' + app.get('port'));
    console.info('DEBUG: Platform: ' + os.platform());
    /**
    * sets up User variable that utilizes UserSchema and sets up database connection
    **/
    if (os.platform() == 'win32') {
        console.log('DEBUG: ' + __dirname + '/mongodb/data');
        ls = childProcess.spawn(__dirname + '/mongodb/win32/mongod.exe', ['--journal', '--dbpath', __dirname + '/mongodb/data']);
        // ls.stdout.on('data', function (data) {
        //     console.log('DEBUG: db: ' + data);
        // });
        ls.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        ls.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
        setTimeout(function () {
            User = mongoose.model('User', UserSchema);
            mongoose.connect('mongodb://localhost/SynergyCodeCredentials'); //set connect destination as needed!!!
            db = mongoose.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            /**
             * makes sure the user collection in the database exists;
             * if it doesn't, the collection is created and a default admin profile is created
             **/
             db.once('open', function callback() {
                mongoose.connection.db.collectionNames(function (err, names) {
                    if (names.length == 0) {
                        console.log('DEBUG: Database Is Empty; Creating admin Profile');
                        var user = {
                            _id: new ObjectID(),
                            username: 'admin',
                            password: 'admin',
                            account_level: 'admin'
                        };
                        db.collection('users').insert(user, function callback() {
                            console.log('DEBUG: Admin Profile created');
                        });
                    }
                });
                console.log('DEBUG: Database connection successful.');
            });
     }, 2000);
       
    }else/** if(os.platform()=='linux'){
        var chown = childProcess.spawn('sudo', ['chown','mongodb', '/mongodb/data/db'], function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            };
        });
        chown.stdout.on('data', function (data) {
            console.log('DEBUG: chown: '+ data);
        });
        chown.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
        ls = childProcess.spawn(__dirname +'/mongodb/linux/mongod', ['--dbpath', __dirname+'/mongodb/data']);
        ls.stdout.on('data', function (data) {
            console.log('DEBUG: db: ' + data);
        });
        ls.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        ls.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    }else**/{
        console.log('DEBUG: OS support still in progress; features may be unstable');
    };
    
});

/**
* Strategy and Schema declaration for database access
**/
var LocalStrategy = require('passport-local').Strategy,
    Schema = mongoose.Schema,
    UserSchema = new Schema({
        username: String,
        password: String,
        account_level: String
});

var options = {db: {type: 'none'}};

sharejs.attach(app, options);

/**
* validPassword method that checks if the entered password matches the entered username
**/
UserSchema.methods.validPassword = function(pass){
    if(pass == this.password){
        return true;
    }
    return false;
}

/**
* sets up User variable that utilizes UserSchema and sets up database connection
**/
var User = mongoose.model('User', UserSchema);
mongoose.connect('mongodb://localhost/SynergyCodeCredentials');            //set connect destination as needed!!!
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/**
* makes sure the user collection in the database exists;
* if it doesn't, the collection is created and a default admin profile is created
**/
db.once('open', function callback() {
    mongoose.connection.db.collectionNames(function(err, names){
        if(names.length == 0){
            console.log('DEBUG: Database Is Empty; Creating admin Profile');
            var user = {
                _id: new ObjectID(),
                username: 'admin',
                password: 'admin',
                account_level: 'admin'
            };
            db.collection('users').insert(user, function callback(){});
        }
    });
  console.log('DEBUG: Database connection successful.');
});

/**
* requiresLogin - allows for authentication to take place in a GET request before certain pages are accessed
**/
var requiresLogin = function(req, res, next){
    if(!req.isAuthenticated()){
        return res.send(400);
    }
    next();
}

/**
* sets up passport's strategy for verfying logins
**/
passport.use(new LocalStrategy(function(username, password, done){
    User.findOne({username:username}, function(err, user){
        if(err){
            console.log('DEBUG: Unknown Error While Querying Database');
            return done(err);
        }
        if(!user){
            console.log('DEBUG: Incorrect Username');
            return done(null, false, {message: 'Incorrect username.'});
        }
        if(!user.validPassword(password)){
            console.log('DEBUG: Incorrect Password');
            return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null,user);
    });
}));

/**
* the following methods serialize and deserialize the user on login and logout
**/
passport.serializeUser(function(user,done){
    done(null, user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id, function(err,user){
        done(err,user);
    });
});

/**
* signout - logs out the user
**/
var signout = function(req, res){
    req.logout();
    res.redirect('/');  
}

/**
* handlers for the server's GET requests
**/
app.get('/', pageRouter.index);
app.get('/edit', requiresLogin, pageRouter.filetest);
app.get('/logout', signout);
app.get('/create', requiresLogin, pageRouter.create);
app.get('/admin', requiresLogin, function(req, res){
    User.findOne({username: req.user.username}, function(err, user){
        if(user.account_level == 'admin'){
            res.render('adminPanel.ejs');
        }else{
            console.log('DEBUG: User Has Insufficient Permissions To Visit Admin Page.');
            res.render('permissionProblem.ejs');
        }
    });
});

/**
* handles server's login requests
**/
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/edit',
        failureRedirect: '/',
        failureFlash: true
    })
);

/**
* compiles a list of files in editableFsiles directory
**/
var stringHeader = "<ul class='jqueryFileTree' style='display: none;'>";
var stringFooter = "</ul>";
// arguments: path, directory name
var formatDirectory =
    "<li class='directory collapsed'><a href='#' rel='%s/'>%s</a><li>";
// arguments: extension, path, filename
var formatFile = "<li class='file ext_%s'><a href='#' rel='%s'>%s</a></li>";

var createStatCallback = (function (res, path, fileName, isLast) {
    return function (err, stats) {

        if (stats.isDirectory()) {
            res.write(util.format(formatDirectory, path, fileName));
        } else {
            var fileExt = fileName.slice(fileName.lastIndexOf('.') + 1);

            res.write(util.format(formatFile, fileExt, path, fileName));
        }

        if (isLast) {
            res.end(stringFooter);
        }
    }
});

/**
* passes the compiled list of files to file tree on front end
**/
app.post('/loadFileTree', function (req, res) {
    // 'text/html'
    res.writeHead(200, {
        'content-type': 'text/plain'
    });
    res.write(stringHeader);

    // get a list of files
    fs.readdir(__dirname + '/public/editableFiles/', function (err, files) {
        for (var i = 0; i < files.length; i++) {
            var fileName = files[i];
            var path = util.format('%s%s', __dirname + '/public/editableFiles/', fileName);
            var isLast = (i === (files.length - 1));


            var statCallback = createStatCallback(res, path, fileName, isLast);

            fs.stat(path, statCallback);
        }

    });
});

//tells socket io to listen to our server
var sio = io.listen(server);

//sets the authorization for socket
sio.set('authorization', function (handshakeData, accept) {
    if (handshakeData.headers.cookie) {
        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
        handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');
        if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
            return accept('Cookie is invalid.', false);
        }
    } else {
        return accept('No cookie transmitted.', false);
    }
    accept(null, true);
});

/**
* handles socket requests from front end
**/
sio.sockets.on('connection', function (socket) {
    
    //sends welcome message to chat
    socket.emit('message', {
        message: 'Welcome to the chat!'
    });
    
    //this handles the chat
    socket.on('send', function (data) {
        sio.sockets.emit('message', data);
    });

    //loads a file into the editor
    socket.on('fileLoad', function (data) {
        filePath = data.message;
        fileNameArray = filePath.split("/");
        fileName = fileNameArray[fileNameArray.length - 1];
        fs.readFile(__dirname + '/public/editableFiles/' + fileName, "utf8", function (err, data) {
            if (err) {
                console.log(err);
                throw err;
            }
            socket.emit('fileData', {
                message: data
            });
        });
        console.log('DEBUG: File Loaded');
    });
    
    //saves files to editableFiles directory
    socket.on('fileChanged', function (data) {
        fs.writeFile('public/editableFiles/' + fileName, data.message, function (err) {
            if (err) {
                throw err;
            }
        });
    });

    //creates a new file in editableFiles directory
    socket.on('createFile', function (data) {
        fs.writeFile('public/editableFiles/' + data.message, "", function (err) {
            if (err) {
                throw err;
            }
            console.log('DEBUG: File Created');
        });
    });
});
