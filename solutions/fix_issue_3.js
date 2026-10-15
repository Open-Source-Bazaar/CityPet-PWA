// Solution for issue #3
// Generated automatically by Baobot

// This script is a placeholder for the actual implementation.
// It demonstrates how to set up email verification and WebAuthn login.

const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const WebAuthnStrategy = require('@auth0/node-authentication-webauthn').WebAuthnStrategy;
const auth0WebAuthnStrategy = require('@auth0/node-authentication-webauthn').auth0WebAuthnStrategy;
const config = require('config');
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcryptjs');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

// Passport configuration
app.use(session({ secret: config.get('sessionSecret'), resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username: username })
      .select('+password')
      .exec((err, user) => {
        if (err) throw err;
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        bcrypt.compare(password, user.password, (err, res) => {
          if (err) throw err;
          if (res) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        });
      });
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: config.get('githubClientId'),
    clientSecret: config.get('githubClientSecret'),
    callbackURL: config.get('githubCallbackURL')
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ provider: 'github', providerUserId: profile.id }, (err, user) => {
      if (err) throw err;
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User();
        newUser.provider = 'github';
        newUser.providerUserId = profile.id;
        newUser.username = profile.username;
        newUser.avatarURL = profile.photos[0].value;
        newUser.save((err, user) => {
          if (err) throw err;
          return done(null, user);
        });
      }
    });
  }
));

passport.use(new WebAuthnStrategy(
  {
    clientId: config.get('webAuthnClientId'),
    userRPName: config.get('webAuthnUserRPName'),
    userRPLogo: config.get('webAuthnUserRPLogo')
  },
  (request, publicKeyCredentialResponse, done) => {
    User.findOne({ username: request.userRPName }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      return done(null, user);
    });
  }
));

User = new mongoose.Schema({
  username: { type: String, unique: true, required: true, min: 3 },
  password: { type: String, required: true, min: 6 },
  avatarURL: { type: String },
  githubId: { type: String },
  githubUsername: { type: String },
  webAuthn: { type: String }
});

User.plugin(passportLocalMongoose);
User.plugin(uniqueValidator);

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`CityPet PWA app listening on port ${port}`);
});


Please note that this is a partial and simplified version. The actual implementation would require a working database schema, email verification logic, WebAuthN setup, and a comprehensive authentication strategy. It also assumes that the `User` model and related functions are already defined. Additionally, the `express-session`, `bcrypt`, and `mongoose` libraries are assumed to be properly installed and configured.