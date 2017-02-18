var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/Releaf";

module.exports = function(passport) {
    passport.use('login', new LocalStrategy(function(username, password, done) {
    
    mongo.connect(mongoURL, function(){
        console.log('Connected to mongo at: ' + mongoURL);
        var loginCollection = mongo.collection('users');

            process.nextTick(function(){
                loginCollection.findOne({username: username, password:password}, function(error, user) {
                	console.log("user = " + user);
                    if(error) {
                        return done(error);
                    }
                    if(!user) {
                        return done(null, false);
                    }
                    if(user.password != password) {
                        done(null, false);
                    }
                    console.log(user.username);
                    done(null, user);
                });
            });
        });
    }));
};
