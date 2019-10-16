const express = require('express');
const router = express.Router();
const qr = require('qr-image');

// ----------------------- ROUTES -----------------------
router.get('/', (req, res) => {
	res.render('index');
});
//  generate post, get get
router.get('/qr/:action', (req, res) => {
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

router.post('/user/:action', (req, res) => {
	var action = req.params.action;
	var username = req.body.username;
	var password = req.body.password;
	var response;
	if (action==='register'){
		req.db.collection('users').findOne({username: username}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
            if(result){
                response = {
                    success: false,
                    data: {
                        message: "User tidak terdaftar dalam database"
                    }
                }
                res.status(404).json(response);
			}
			req.db.collection('users').insertOne({username: username,password: password}, (err, result) => {
				if(err) throw new Error('Gagal menambahkan username');
				response = {
					success: true,
					data : result
				}
			})
			res.status(200).json(response);
		})
	}
	else if (action==='login'){
		req.db.collection('users').findOne({username: username,password: password}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
            if(!result){
                response = {
                    success: false,
                    data: {
                        message: "User tidak terdaftar dalam database"
                    }
                }
                res.status(404).json(response);
			}
			res.status(200).json(response);
		})
	}
	else if (action==='changepwd'){
	}
	res.send(response).String();
});

module.exports = router;