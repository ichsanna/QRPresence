const express = require('express');
const router = express.Router();
const sha1 = require('sha1');
const passport = require('passport');
const localstrategy = require('passport-local').Strategy;

// Panggil api pake request web, kaya register, create class
// ----------------------- PASSPORT -----------------------
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
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
	req.db.collection('classes').find({"owner": req.user.username}).toArray((err,result) => {
		if(err) throw new Error('Gagal mendapatkan kelas');
		res.render('main',{data: req.user, kelas: result})
	})
})
router.get('/login', (req,res) => {
	res.render('login');
});
router.get('/register', (req,res)=> {
	res.render('register')
})
router.get('/class/:classid', (req,res) => {
	req.db.collection('classes').findOne({"classid": req.params.classid}, (err,result) => {
		if(err) throw new Error('Gagal mendapatkan kelas');
		if (result.presensi == null) {
			var jumlah = 0;
		}
		else {
			var jumlah = Object.keys(result.presensi).length;
		}
		res.render('kelas',{data: req.user, kelas: result, jumlah: jumlah})
	})
})
module.exports = router;