/**
* GET pages based on passed in request
**/

exports.index = function(req, res){
	res.render('index', { title: 'SynergyCode' });
};
exports.filetest = function(req, res){
	res.render('filetest', { title: 'SynergyCode' });
};
exports.create = function(req, res){
	res.render('createFile');
};