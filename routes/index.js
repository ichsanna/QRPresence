const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://<hahaha>:<abc123>@ds235078.mlab.com:35078/hahihu"

function dbconnection(type,object){
	var message="Success";
	MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
		if (err) throw err;
		var dbo = db.db("qrpresence");
		if (type==="insertone"){
			dbo.collection("users").insertOne(object, function(err, res) {
				if (err){
					message = "Error";
					throw err;
				}
				db.close();
			});
		}
	  });
	return (JSON.stringify(object));
}

// ----------------------- ROUTES -----------------------
router.get('/', function (req, res, next) {
	res.render('index');
});
//  generate post, get get
router.get('/qr/:action', function (req, res, next) {
	var action = req.params.action;
	if (action==='generate'){
		var output = qr.image(req.query['classID'], {type: 'png',margin: 1,size: 50,ec_level: 'H'});
		res.type('png');
		output.pipe(res);
	}
	else if (action==='get'){
		console.log("get");
	}
});

router.post('/user/:action', function (req, res, next) {
	var action = req.params.action;
	var username = req.body.username;
	var password = req.body.password;
	var type;
	var obj;
	if (action==='register'){
		type = "findone";
		object = {username: username, password: password};
		type = "insertone";
		object = {username: username, password: password};
		var found = dbconnection(type,object);
		if (found!=="Error"){
			type = "insertone";
			object = {username: username, password: newpassword};
			output = dbconnection(type,object);
		}
		else{
			output = "Error";
		}
	}
	else if (action==='login'){
		type = "findone";
		object = {username: username, password: password};
	}
	else if (action==='changepwd'){
		var newpassword = req.body.newpassword;
		type = "findone";
		object = {username: username, password: password};
		var found = dbconnection(type,object);
		if (found!=="Error"){
			type = "updateone";
			object = {username: username, password: newpassword};
			output = dbconnection(type,object);
		}
		else{
			output = "Error";
		}
	}
	if (action!=='changepwd'){
		output = dbconnection(type,object);
	}
	res.type('application/json');
	res.send(req.body);
});

module.exports = router;