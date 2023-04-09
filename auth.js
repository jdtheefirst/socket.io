const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');
const googleStrategy = require('passport-google-oauth20').Strategy;

function auth (myDataBase) {
    console.log('route visited');
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
        if (err) return console.error(err);
        done(null, doc);
    });
  });

  passport.use(new LocalStrategy((username, password, done) => {
    myDataBase.findOne({ username: username }, (err, user) => {
      console.log(`User ${username} attempted to log in.`);
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!bcrypt.compareSync(password, user.password)) { 
        return done(null, false);
      }
      return done(null, user);
    });
  }));

  // passport.use(new googleStrategy({
  //   clientID: process.env.GOOGLE_CLIENT_ID,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   callbackURL: 'https://localhost:8080/auth/github/callback'
  //   },
  //   function (accessToken, refreshToken, profile, cb) {
  //     console.log(profile);
     
  //   }
  // ));
}
module.exports = auth;