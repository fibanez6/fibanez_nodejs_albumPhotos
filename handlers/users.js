/**
 * Created by fibanez on 20/9/15.
 */

var helpers = require('./../helpers/helpers.js'),
    user_data = require("../datamanager/mysql/user.js"),
    async = require('async'),
    pbkdf2 = require('pbkdf2-sha256');
//crypto = require('crypto');
//bcrypt = require('bcrypt');

exports.version = "0.1.0"

exports.logged_in = function (req, res) {
    var li = (req.session && req.session.logged_in_email);
    helpers.send_success(res, { logged_in: li });
};

exports.register = function (req, res) {
    async.waterfall([
        function (callback) {
            var em = req.body.email;
            if (!em || em.indexOf("@") == -1)
                callback(helpers.invalid_email());
            else if (!req.body.display_name)
                callback(helpers.missing_data("display_name"));
            else if (!req.body.password)
                callback(helpers.missing_data("password"));
            else
                callback(null);
        },

        // register da user.
        function (callback) {
            user_data.register(
                req.body.email,
                req.body.display_name,
                req.body.password,
                callback);
        },

        // mark user as logged in
        function (user_data, callback) {
            req.session.logged_in = true;
            req.session.logged_in_email = req.body.email;
            req.session.logged_in_display_name = user.display_name;
            req.session.logged_in_date = new Date();
            callback(null, user_data);
        }
    ],

    function (err, user_data) {
        if (err) {
            helpers.send_failure(res, err);
        } else {
            var u = new User(user_data);
            helpers.send_success(res, {user: u.response_obj() });
        }
    });
};

