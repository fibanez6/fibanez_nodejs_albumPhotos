/**
 * Created by fibanez on 11/8/15.
 */
var helpers = require('./../../helpers/helpers.js'),
    pbkdf2 = require('pbkdf2-sha256'),
    _ = require('underscore');
    //crypto = require('crypto');
    //bcrypt = require('bcrypt');

exports.version = "0.1.0";

function User (user_data) {
    this._id = user_data["id"];
    this.email = user_data["email"];
    this.username = user_data["username"];
    this.password = user_data["password"];
    this.last_login_date = user_data["last_login"];
    this.last_modified_date = user_data["last_modified_date"];
    this.is_active = user_data["is_active"];
}

User.prototype._id = null;
User.prototype.email = null;
User.prototype.username = null;
User.prototype.password = null;
User.prototype.last_login_date = null;
User.prototype.last_modified_date = null;
User.prototype.is_active = false;
User.prototype.check_password = function (pw, callback) {
    //bcrypt.compare(pw, this.password, callback);
    if (pw == null || this.password == null) {
        return process.nextTick(function() {
            cb(new Error('data and hash arguments required'));
        });
    }
    var parts = this.password.split('$');
    var iterations = parts[1];
    var salt = parts[2];
    var hash = pbkdf2(pw, new Buffer(salt), iterations, 32).toString('base64');
    //bcrypt.compare(hash, parts[3], callback);
    if (callback && !_.isFunction(callback)) {
        callback(null, hash === parts[3])
    } else {
        return hash === parts[3];
    }

};
User.prototype.response_obj = function () {
    return {
        _id: this._id,
        email: this.email,
        display_name: this.username,
        last_login_date: this.last_login_date,
        last_modified_date: this.last_modified_date
    };
};

module.exports = User;
