const express = require('express');
const router = express.Router();
const qr = require('qr-image');

// ----------------------- ROUTES -----------------------
router.get('/', (req, res) => {
	res.render('index');
});
//  generate post, get get
router.get('/qr/get', (req, res) => {
	var output = qr.image(req.query['classID'], {type: 'png',margin: 1,size: 50,ec_level: 'H'});
	res.type('png');
	output.pipe(res);
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
						res.status(404).json(response);
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