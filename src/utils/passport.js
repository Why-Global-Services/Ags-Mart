const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("../config/config");
const { User } = require("../models/users.model");

const authUser = async (request, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: email,
        googleId: profile.id,
        profilePhoto: profile.photos[0].value, // Optional
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl, // Don't hardcode URL
    },
    authUser
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id); // only store the ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
