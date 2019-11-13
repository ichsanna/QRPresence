const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const sha1 = require('sha1');
const randomstring = require('crypto-random-string');
const passport = require('passport');
const localstrategy = require('passport-local').Strategy;
const excel4node = require('excel4node');

// ----------------------- PASSPORT -----------------------
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});
passport.use('login', new localstrategy(
	{passReqToCallback: true},
    function (req, username, password, done){
		password = password.split("").reverse().join("")
		password = sha1(password+username)
		req.db.collection('users').findOne({username: username,password: password},(err,result) => {
			if(err) return done(err)
            if(!result){
                return done(null,false)
			}
			else {
				delete result.password
				return done(null, result)
			}
		})
    })
);
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    else res.redirect('/login');
}
// ----------------------- WEB ROUTES -----------------------
router.get('/', isLoggedIn, (req,res) =>{
	res.render('main')
})
router.get('/login', (req,res) => {
	res.render('login');
});
router.get('/register', (req,res)=> {
	res.render('register')
})

// ----------------------- API ROUTES -----------------------
router.post('/api/web/user/login', passport.authenticate('login',{failureRedirect: '/login'}), (req,res) => {
	res.redirect('/')
})
router.post('/api/web/user/register', (req,res) => {
	var username = req.body.username
	var password = req.body.password
	var fullname = req.body.fullname
	var nim = req.body.nim
	password = password.split("").reverse().join("")
	password = sha1(password+username)
	req.db.collection('users').findOne({"username": username}, (err, result) => {
		if(err) throw new Error('Gagal mendapatkan username');
        if(result){
			res.status(404).redirect("/register");
		}
		else{
			req.db.collection('users').insertOne({"username": username,"password": password,"fullname": fullname,"nim": nim}, (err, result) => {
				if(err) throw new Error('Gagal menambahkan username');
				res.status(200).redirect("/login");
			})
		}
	})
})
router.get('/api/web/user/logout', (req,res) => {
	req.logout()
	res.redirect('/')
})
router.get('/api/qr/get', (req, res) => {
	var output = qr.image(req.query['classid'], {type: 'png',margin: 1,size: 50,ec_level: 'H'});
	res.type('png');
	output.pipe(res);
});
router.get('/api/generatereport', (req,res) => {
	var classid = req.body.classid;
	req.db.collection('classes').findOne({"classid": classid}, (err,result) => {
		if (err) throw new Error('Gagal mendapatkan info kelas')
		if(!result){
			let response = {
				success: false,
				data: {
					message: "Kelas tidak ditemukan"
				}
			}
			res.status(404).json(response);
		}
		else {			
			var workbook = new excel4node.Workbook();

			// Add Worksheets to the workbook
			var worksheet = workbook.addWorksheet('Sheet 1');
					
			// Create a reusable style
			var style = workbook.createStyle({
			  font: {
			    color: '#FF0800',
			    size: 12
			  },
			  numberFormat: '$#,##0.00; ($#,##0.00); -'
			});
			
			// Set value of cell A1 to 100 as a number type styled with paramaters of style
			worksheet.cell(1,1).number(100).style(style);
			
			// Set value of cell B1 to 300 as a number type styled with paramaters of style
			worksheet.cell(1,2).number(200).style(style);
			
			// Set value of cell C1 to a formula styled with paramaters of style
			worksheet.cell(1,3).formula('A1 + B1').style(style);
			
			// Set value of cell A2 to 'string' styled with paramaters of style
			worksheet.cell(2,1).string('string').style(style);
			
			// Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
			worksheet.cell(3,1).bool(true).style(style).style({font: {size: 14}});
			
			workbook.write('Excel.xlsx');
			
			res.status(200).send(workbook);
		}
	})
})
// NEK UDAH JADI DIHAPUS
router.get('/api/getusers', (req,res) => {
	var output = req.db.collection('users').find().toArray()
	output.then((result) => {
		res.send(result)
	})
});

router.post('/api/class/:action', (req,res) => {
	var action = req.params.action
	var username = req.body.username
	if (action==='create'){
		var classid = randomstring({length: 15});
		req.db.collection('classes').findOne({"classid": classid}, (err, result) => {
			if (err) throw new Error('Gagal mendapatkan info kelas');
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
		var classid = req.body.classid;
		req.db.collection('classes').findOne({"classid": classid,"presensi.fullname": fullname,"presensi.nim": nim}, (err, result) => {
			if(err) throw new Error('Gagal mendapatkan username');
            if(!result){
				req.db.collection('classes').update({"classid": classid},{$push:{"presensi": fieldpresensi}}, {upsert: true}, (err,result) => {
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
				let response = {
                    success: false,
                    data: {
						message: "Anda sudah melakukan presensi"
					}
                }
                res.status(404).json(response);
			}
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
		password = password.split("").reverse().join("")
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
		password = password.split("").reverse().join("")
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
		password = password.split("").reverse().join("")
		password = sha1(password+username)
		newpassword = newpassword.split("").reverse().join("")
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