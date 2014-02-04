
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'SynergyCode' });
};
exports.filetest = function(req, res){
	res.render('filetest', { title: 'SynergyCode' });
};