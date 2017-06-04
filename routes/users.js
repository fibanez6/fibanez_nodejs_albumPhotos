var express = require('express');
var router = express.Router();

var user_hdlr = require('../handlers/users.js'),
    auth = require('../middlewares/authentication.js');

/* GET users listing. */
//router.put('/users.json', user_hdlr.register);
//router.post('/login.json', auth.login);
//router.get('/logged_in.json', user_hdlr.logged_in);

router.get('/login', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/pages/admin/home");
    } else {
        res.render('login', { title: 'Login' });
    }
});

router.get('/register', function(req, res, next) {
    res.render('register');
});

router.get('/', auth.requireAuth, function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
