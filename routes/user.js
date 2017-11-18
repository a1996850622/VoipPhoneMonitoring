/*
 * GET users listing.
 */

var mongoose = require('mongoose');
var Table = mongoose.model('Table');
var express = require('express');
var app = express();

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.signout = function(req, res){
	req.session.logined = false;
	res.redirect('/');
	res.end();
};

exports.database = function(req, res){
	if(req.session.logined){
		res.locals.username = req.session.name;
		res.locals.authenticeted = req.session.logined;
		//res.render('users/database');

		Table.find(function(err, tables, count){
			res.render('users/database', {
				title: "Database",
				tables: tables
			});
		});
		return;
	}
	res.render('/');
};

exports.tap = function(req, res){
	if(req.session.logined){
		res.locals.username = req.session.name;
		res.locals.authenticated = req.session.logined;
		res.render('users/tap');
		return;
	}
	res.render('/');
};

exports.login = function(req, res){
	if((!req.body.user)||(!req.body.passwd)){
		res.redirect('/');
		return;
	}
	req.session.name = req.body.user;
	req.session.passwd = req.body.passwd;
	req.session.logined = true;
	res.redirect('tap');
};

/*
exports.audio_download = function(req, res){
	var data;
	Table.find({_id: req.params.id}, function(err, tables){
		for(var index in tables){
			data = tables[index];
			console.log(data.Audio_file);
		}
	});

	res.get('/downloadaudio', function(req, res) {
        var file = '/home/chris/Desktop/Project/System/file/' + data.CreateDate + '/' + data.Audio_file;
        console.log(file);
        res.download(file); // Set disposition and send it.
        console.log('hello');
    });

	//res.redirect('database');
}


exports.txt_download = function(req, res){
	var data;
	Table.find({_id: req.params.id}, function(err, tables){
		for(var index in tables){
			data = tables[index];
			console.log(data.Txt_file);
		}
		app.get('/downloadtxt', function(req, res) {
            var file = __dirname + '../file/' + data.CreateDate + '/' + data.Txt_file;
            res.download(file, function(err){
            	if(err){
            		if(res.headersSent){
            			console.log("send header");
            		} else{
            			return res.sendStatus(SOME_ERR);
            		}
            	}
            }); // Set disposition and send it.
        });
	});
	res.redirect('database');
}
*/

exports.del_data = function(req, res){
	Table.remove({_id: req.params.id}, function(err){
		if(err)
			console.log('Fail to delete data.');
		else
			console.log('Success to delete data.');
	});
	res.redirect('database');
}