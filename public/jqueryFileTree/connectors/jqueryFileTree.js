/* This node script listens for POST requests on /, interprets the 'dir'
 *  variable as a path to list and returns the unordered list format
 * expected by jqueryFileTree
 * http://www.abeautifulsite.net/blog/2008/03/jquery-file-tree/
 *
 * It also serves  pages out of the _static directory contained in
 * the current directory. Place your example html in there.
 */
var express = require('express'),
        util = require('util'),
        fs = require('fs'),
        app = express();
 
 
var stringHeader = "<ul class='jqueryFileTree' style='display: none;'>";
var stringFooter = "</ul>";
// arguments: path, directory name
var formatDirectory =
        "<li class='directory collapsed'><a href='#' rel='%s/'>%s</a><li>";
// arguments: extension, path, filename
var formatFile = "<li class='file ext_%s'><a href='#' rel='%s'>%s</a></li>";
 
var createStatCallback = (function(res, path, fileName, isLast){
        return function(err, stats){
       
                if(stats.isDirectory())
                {
                        res.write(util.format(formatDirectory, path, fileName));
                }
                else
                {
                        var fileExt = fileName.slice(fileName.lastIndexOf('.')+1);
       
                        res.write(util.format(formatFile, fileExt, path, fileName));
                }
 
                if(isLast){
                         res.end(stringFooter);
                }
        }
});

app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, '/public')));
app.post('/', function(req, res){
 
        // 'text/html'
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write(stringHeader);
 
        // get a list of files
        fs.readdir(req.body.dir, function(err, files){
       
                for(var i = 0; i < files.length; i++)
                {
                        var fileName = files[i];
                        var path = util.format('%s%s', req.body.dir, fileName);
                        var isLast = (i === (files.length-1));
 
 
                        var statCallback = createStatCallback(res, path, fileName, isLast);
 
                        fs.stat(path, statCallback);
                }
 
        });
};)
