/**
 * Created by fibanez on 11/8/15.
 */
var express = require('express');
var auth = require('../middlewares/authentication.js');

var router = express.Router();

module.exports = function(passport){

    /* GET login page. */
    router.get('/login', function(req, res) {
        // Display the Login page with any flash message, if any
        res.render('login', { message: req.flash('message') });
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/pages/admin/home',
        failureRedirect: '/auth/login',
        failureFlash : true
    }));

    router.get('/logout', auth.logout);

    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    router.get('/facebook', passport.authenticate('facebook'));

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    router.get('/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/pages/admin/home',
            failureRedirect: '/auth/login',
            failureFlash : true
        }));

    return router;
};
