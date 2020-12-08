const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/User');

const extractFromCookie = req => {
  return req.cookies['token'];
};

const options = {
  secretOrKey: process.env.JWT_SECRET_KEY,
  jwtFromRequest: extractFromCookie
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    let user;
    try {
      user = await User.findOne({ username: payload.username });
    } catch (e) {
      return done(e, false);
    }

    if (user) {
      return done(null, user);
    }

    return done(null, false);
  })
);
