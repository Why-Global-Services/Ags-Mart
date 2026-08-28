const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models/users.model");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const config = require("../config/config");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const client = new OAuth2Client(config.google.clientId);

const userGoogleSignUp = catchAsync(async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "A valid Google token is required");
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.google.clientId,
  });

  const userGoogleData = ticket.getPayload();

  const { name, email, sub: googleId, picture: profilePhoto } = userGoogleData;

  if (!email || !name) {
    throw new ApiError(400, "Invalid Google user data");
  }

  let user = await User.findOne({ email });

  if (user) {
    if (user.status === "block") {
      throw new ApiError(
        403,
        "Your account has been blocked. Contact support."
      );
    }
  } else {
    user = await User.create({
      name,
      email,
      googleId,
      profilePhoto,
    });
  }

  const appToken = generateToken(user._id, "user");

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token: appToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
    },
  });
});

module.exports = {
  userGoogleSignUp,
};
