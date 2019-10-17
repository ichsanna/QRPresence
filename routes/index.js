const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const md5 = require('md5');

// ----------------------- ROUTES -----------------------
router.get('/', (res) => {
	res.render('index');
});
router.get('/qr/:action', (req, res) => {
	var action = req.params.action;
	if (action==='get'){
		//check qrsalt in database, if not exist redirect generate
		//retrieve qrsalt in database, change req.query['classid'] to classid+qrsalt
		var output = qr.image(req.query['classid'], {type: 'png',margin: 1,size: 50,ec_level: 'H'});
		res.type('png');
		output.pipe(res);
	}
	else if (action==='generate'){
		var qrsalt = md5(Date.now())
		req.db.collection('class').updateOne({"classid": classid}, {"$set": {"qrsalt": qrsalt}}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
			if(result){
				let response = {
					success: true,
					data: result
				}
				res.status(200).json(response);
			}
		})
		res.redirect('/qr/get?class='+classid)
	}
});

router.post('/user/:action', (req, res) => {
	var action = req.params.action;
	var username = req.body.username;
	var password = req.body.password;
	var newpassword = req.body.newpassword;
	var fullname = req.body.fullname;
	var nim = req.body.nim;
	if (action==='register'){
		req.db.collection('users').findOne({"username": username}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
            if(result){
                let response = {
                    success: false,
                    data: {
                        message: "User sudah terdaftar"
                    }
                }
                res.status(404).json(response);
			}

			req.db.collection('users').insertOne({"username": username,"password": password,"fullname": fullname,"nim": nim}, (err, result) => {
				if(err) throw new Error('Gagal menambahkan username');
				let response = {
					success: true,
					data : result
				}
				res.status(200).json(response);
			})
		})
	}
	else if (action==='login'){
		req.db.collection('users').findOne({"username": username,"password": password}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
            if(!result){
                let response = {
                    success: false,
                    data: {
                        message: "Username dan/atau password salah"
                    }
                }
                res.status(404).json(response);
			}
			else {
				let response = {
                    success: true,
                    data: result
                }
                res.status(200).json(response);
			}
		})
	}
	else if (action==='changepwd'){
		req.db.collection('users').findOne({"username": username,"password": password}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
            if(!result){
                let response = {
                    success: false,
                    data: {
                        message: "Password lama salah"
                    }
                }
                res.status(404).json(response);
			}
			else {
				req.db.collection('users').updateOne({"username": username}, {"$set": {"password": newpassword}}, (err, result) => {
					if(err) throw new Error('Gagal mendapatkan username');
					if(result){
						let response = {
							success: true,
							data: result
						}
						res.status(200).json(response);
					}
				})
			}
		})
	}
	else if (action==='getinfo'){
		req.db.collection('users').findOne({"username": username}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
            if(!result){
                let response = {
                    success: false,
                    data: {
                        message: "Username tidak ditemukan"
                    }
                }
                res.status(404).json(response);
			}
			else {
				let response = {
                    success: true,
                    data: result
                }
                res.status(200).json(response);
			}
		})
	}
});

module.exports = router;