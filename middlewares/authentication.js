/**
 * Created by fibanez on 10/8/15.
 */

exports.version = "0.1.0";

// As with any middleware it is quintessential to call next()
// if the user is authenticated
exports.requireAuth = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/users/login');
};

/* Handle Logout */
exports.logout = function (req, res, next) {
    req.session.destroy();
    req.logout();
    res.redirect("/");
};

exports.authSession = function (req, res, next) {
    if (req.session && req.isAuthenticated()) {
        req.session.user = req.user;
        res.locals.session = req.session;
    }
    next();
};


/* old login */
//var helpers = require('./../helpers/helpers.js'),
//    user_dm = require("../datamanager/user.js"),
//    User = require("../models/user.js"),
//    async = require('async');
//
//exports.requireAuth = function (req, res, next) {
//    // all pages are always approved if you're logged in.
//    if (req.session && req.session.logged_in_email) {
//        res.locals.session = req.session;
//        next();  // continue
//    } else if (req.params.page_name == 'admin') {
//        res.redirect("/users/login");  // force auth for admin pages
//        res.end();
//    } else {
//        res.redirect("/users/login");  // force auth for admin pages
//        res.end();
//    }
//};
//
//exports.login = function (req, res) {
//    var user;
//
//    async.waterfall([
//            function (callback) {
//                var em = req.body.email;
//                if (!em || em.indexOf('@') == -1)
//                    callback(helpers.invalid_email());
//                else if (req.session && req.session.logged_in_email == em.toLowerCase())
//                    callback(helpers.error("already_logged_in", ""));
//                else if (!req.body.password)
//                    callback(helpers.missing_data("password"));
//                else
//                    callback(null);
//            },
//
//            // first get the user by the email address.
//            function (callback) {
//                user_dm.user_by_email(req.body.email, callback);
//            },
//
//            // check the password
//            function (user_data, callback) {
//                user = new User(user_data);
//                user.check_password(req.body.password, callback);
//            },
//
//            function (auth_ok, callback) {
//                if (!auth_ok) {
//                    callback(helpers.auth_failed());
//                    return;
//                }
//
//                req.session.logged_in = true;
//                req.session.logged_in_display_name = user.display_name;
//                req.session.logged_in_email = req.body.email;
//                req.session.logged_in_date = new Date();
//
//                if (req.body.rememberme) {
//                    req.session.cookie.maxAge = 1000 * 60 * 3;
//                    req.session.touch();
//                } else {
//                    req.session.cookie.expires = false;
//                }
//
//                callback(null);
//            }
//        ],
//
//        function (err, results) {
//            if (!err || err.message == "already_logged_in") {
//                helpers.send_success(res, { logged_in: true });
//            } else {
//                helpers.send_failure(res, err);
//            }
//        });
//};
