/**
 * Created by fibanez on 20/9/15.
 */
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/mysql/user'),
    user_dm = require("../datamanager/mysql/user.js");

module.exports = function(passport){
    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            // check in mongo if a user with username exists or not
            //User.findOne({ 'username' :  username },
            user_dm.user_by_email(username, function(err, user_data) {
                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log the error and redirect back
                if (!user_data){
                    console.log('User Not Found with username '+username);
                    return done(null, false, req.flash('message', 'Invalid user or password'));
                }

                var user = new User(user_data);
                if (!user.check_password(password) ) {
                    return done(null, false, req.flash('message', 'Invalid user or password')); // redirect back to login page
                }

                // User and password both match, return user from done method
                // which will be treated like success
                return done(null, user);
            });
        })
    );
};