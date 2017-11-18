
/*
 * GET home page.
 */

var mongoose = require('mongoose');
var Table = mongoose.model('Table');

exports.index = function(req, res){
	if(req.session.logined){
		res.redirect('tap');
		return;
	}
  	res.render('index', { title: 'VoIP Monitor' });
};