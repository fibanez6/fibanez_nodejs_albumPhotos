/**
 * Created by fibanez on 20/9/15.
 */
var login = require('./login'),
    fb_login = require('./provider/facebook'),
    signup = require('./signup'),
    User = require('../models/mysql/user'),
    user_dm = require("../datamanager/mysql/user.js");

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        //console.log('serializing user: ');
        //console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        user_dm.user_by_uuid(id, function(err, user_data) {
            var user = new User(user_data);
            console.log('deserializing user:',user.response_obj());
            done(err, user.response_obj());
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    fb_login(passport);
    //signup(passport);

};