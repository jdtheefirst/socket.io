const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');
const googleStrategy = require('passport-google-oauth20').Strategy;


    console.log('route visited');
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const myDataBase = await client.db('database').collection('users');
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
        if (err) return console.error(err);
        done(null, doc);
    });
  });

  passport.use(new LocalStrategy( async (username, password, done) => {
    const myDataBase = await client.db('database').collection('users');

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

