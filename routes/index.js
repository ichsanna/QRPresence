const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const sha1 = require('sha1');
const randomstring = require('crypto-random-string');
const passport = require('passport');
const localstrategy = require(passport-local).Strategy;

// ----------------------- PASSPORT -----------------------
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});
 
// passport local strategy for local-login, local refers to this app
passport.use('login', new LocalStrategy(
    function (username, password, done) {
        if (username === users[0].username && password === users[0].password) {
            return done(null, users[0]);
        } else {
            return done(null, false, {"message": "User not found."});
        }
    })
);
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
 
    res.sendStatus(401);
}
// ----------------------- WEB ROUTES -----------------------
router.get('/', (req,res) =>{
	res.redirect('/login')
})
router.get('/login', (req,res) => {
	res.render('login');
});
router.get('/register', (req,res)=> {
	res.render('register')
})

// ----------------------- API ROUTES -----------------------
router.get('/api/qr/get', (req, res) => {
	var output = qr.image(req.query['classid'], {type: 'png',margin: 1,size: 50,ec_level: 'H'});
	res.type('png');
	output.pipe(res);
});

// NEK UDAH JADI DIHAPUS
router.get('/api/getusers', (req,res) => {
	var output = req.db.collection('users').find().toArray()
	output.then((result) => {
		res.send(result)
	})
});

router.post('/api/class/:action', (req,res) => {
	var action = req.params.action
	var classid = randomstring({length: 15});
	var username = req.body.username
	if (action==='create'){
		req.db.collection('classes').findOne({"classid": classid}, (err, result) => {
			if (err) throw new Error('Gagal mendapatkan kelas');
			if (!result){
				req.db.collection('classes').insertOne({"owner": username,"classid": classid}, (err, result) => {
					if(err) throw new Error('Gagal menambahkan kelas');
					let response = {
						success: true,
						data : {
							classid: classid
						}
					}
					res.status(200).json(response);
				})
			}
			else res.status(400).json({success: false})
		})
	}
	else if (action==='presensi'){
		var fullname = req.body.fullname
		var nim = req.body.nim
		var fieldpresensi = {fullname: fullname, nim: nim}
		req.db.collection('classes').update({"classid": classid},{$push:{"presensi": fieldpresensi}}, (err,result) => {
			if(err) throw new Error('Gagal menambahkan kelas');
			let response = {
				success: true,
				data : {
					classid: classid,
					fullname: fullname,
					nim: nim
				}
			}
			res.status(200).json(response);
		})
	}
	else {
		res.status(404).send("Error")
	}
})
router.post('/api/user/:action', (req, res) => {
	var action = req.params.action
	var username = req.body.username
	var password = req.body.password
	var newpassword = req.body.newpassword
	var fullname = req.body.fullname
	var nim = req.body.nim
	if (action==='register'){
		password.split("").reverse().join("")
		password = sha1(password+username)
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
			else {
				req.db.collection('users').insertOne({"username": username,"password": password,"fullname": fullname,"nim": nim}, (err, result) => {
					if(err) throw new Error('Gagal menambahkan username');
					delete result.password
					let response = {
						success: true,
						data : result
					}
					res.status(200).json(response);
				})
			}
		})
	}
	else if (action==='login'){
		password.split("").reverse().join("")
		password = sha1(password+username)
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
				delete result.password
				let response = {
                    success: true,
                    data: result
                }
                res.status(200).json(response);
			}
		})
	}
	else if (action==='changepwd'){
		password.split("").reverse().join("")
		password = sha1(password+username)
		newpassword.split("").reverse().join("")
		newpassword = sha1(newpassword+username)
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
						delete result.password
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
		console.log("aa")
		req.db.collection('users').findOne({"username": username}, (err, result) => {
			console.log("bb")
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
				delete result.password
				let response = {
                    success: true,
                    data: result
                }
                res.status(200).json(response);
			}
		})
	}
	else {
		res.status(404).send("Error")
	}
});

module.exports = router;