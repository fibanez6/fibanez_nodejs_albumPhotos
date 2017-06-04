/**
 * Created by fibanez on 20/9/15.
 */
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    local = require('../../local.config.js');
    User = require('../../models/mysql/user'),
    user_dm = require("../../datamanager/mysql/user.js");

module.exports = function(passport){
    passport.use(new FacebookStrategy({
            clientID: local.config.facebook_config.clientID,
            clientSecret: local.config.facebook_config.clientSecret,
            callbackURL: local.config.app_url+local.config.facebook_config.callbackURL,
            scope: "email",
            profileFields: ['id','displayName','emails','name','profileUrl','photos']
        },
        function(accessToken, refreshToken, profile, done) {
            //FbUsers.findOne({fbId : profile.id}, function(err, oldUser){
            console.log("FB="+JSON.stringify(profile));
            var email = profile.emails[0].value;
            if (email === "fibanez84@gmail.com") {
                email = "fibanez@fibanez.com"
            }
            user_dm.user_by_email(email, function(err, user_data) {
                if (err)
                    return done(err);
                if(user_data){
                    var user = new User(user_data);
                    done(null,user);
                }else{
                    var newUser = new User({
                        id : profile.id ,
                        email : profile.emails[0].value,
                        display_name : profile.displayName
                    });
                        //.save(function(err,newUser){
                        //    if(err) throw err;
                        //    done(null, newUser);
                        //});
                    done(null, newUser);
                }
            });
        }
    ));
};