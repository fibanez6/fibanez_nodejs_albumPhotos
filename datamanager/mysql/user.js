/**
 * Created by fibanez on 11/8/15.
 */

var async = require('async'),
    //bcrypt = require('bcrypt'),
    pbkdf2 = require('pbkdf2-sha256');
    crypto = require('crypto'),
    db = require("../../middlewares/db.js"),
    uuid = require('node-uuid'),
    backhelp = require("./../../helpers/backend_helpers.js");


var salt = "dHG33eiUerQc"; // must remain consistent across installations
var iterations = 12000; // larger = more secure, slower | smaller = less secure, faster
var keylen = 32; // bytes

exports.version = "0.1.0";

exports.user_by_uuid = function (uuid, callback) {
    if (!uuid)
        callback(backend.missing_data("uuid"));
    else
        user_by_field("id", uuid, callback);
};

exports.user_by_email = function (email, callback) {
    if (!email)
        callback(backend.missing_data("email"));
    else
        user_by_field("email", email, callback);
};

exports.register = function (email, display_name, password, callback) {
    var dbc;
    var userid;
    async.waterfall([
        // validate ze params
        function (callback) {
            if (!email || email.indexOf("@") == -1)
                callback(backend.missing_data("email"));
            else if (!display_name)
                callback(backend.missing_data("display_name"));
            else if (!password)
                callback(backend.missing_data("password"));
            else
                callback(null);
        },

        // get a connection
        function (callback) {
            db.db(callback);
        },

        // generate a password hash
        function (dbclient, callback) {
            dbc = dbclient;
            var hashed2 = pbkdf2(password, new Buffer(salt), iterations, 32).toString('base64');
            var finalPass2 = 'pbkdf2_sha256$'+ iterations +'$'+  salt +'$'+  hashed2;
            callback(null, finalPass2);
        },

        // register the account.
        function (hash, callback) {
            userid = uuid();
            var now = Math.round((new Date()).getTime() / 1000);
            dbc.query(
                "INSERT INTO Users VALUES (?, ?, ?, ?, ?, NULL, 0)",
                [ userid, email, display_name, hash, now ],
                backhelp.mscb(callback));
        },

        // fetch and return the new user.
        function (results, callback) {
            exports.user_by_uuid(userid, callback);
        }
    ],
    function (err, user_data) {
        if (err) {
            if (err.code
                && (err.code == 'ER_DUP_KEYNAME'
                || err.code == 'ER_EXISTS'
                || err.code == 'ER_DUP_ENTRY'))
                callback(backhelp.user_already_registered());
            else
                callback (err);
        } else {
            callback(null, user_data);
        }
    });
};

function user_by_field (field, value, callback) {
    var dbc;
    async.waterfall([
        // get a connection
        function (callback) {
            db.db(callback);
        },

        // fetch the user.
        function (dbclient, callback) {
            dbc = dbclient;
            dbc.query(
                "SELECT * FROM auth_user WHERE " + field
                + " = ? AND is_active = true",
                [ value ],
                backhelp.mscb(callback));
        },

        function (rows, callback) {
            if (!rows || rows.length == 0)
                callback(backhelp.no_such_user());
            else
                callback(null, rows[0]);
        }
    ],
    function (err, user_data) {
        if (err) {
            callback (err);
        } else {
            callback(null, user_data);
        }
    });
}