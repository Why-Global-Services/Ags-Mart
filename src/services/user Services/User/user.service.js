const { User } = require("../../../models/users.model");
const sendmail = require("../../../utils/sendmail");
const jwt = require("jsonwebtoken");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");
const generateOtp = require("../../../utils/generateOtp");
const Bcrypt = require("bcryptjs");

/** Create JWT Token */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const createUser = async (req) => {
  const { name, password, phone } = req.body;

  const existing = await User.findOne({ $or: [{phone}]});
  console.log(existing,"this is the existinf gaga");
  
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const salt = await Bcrypt.genSalt(10);
  const hashedPassword = await Bcrypt.hash(password, salt);

  const userData = await User.create({
    name,
    password: hashedPassword,
    phoneNumber: phone,
  });

  return {
    success: true,
    message: "Registered Successfully",
    userId: userData._id,
  };
};

// Login User
const loginUser = async (req) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Phone number and password are required"
    );
  }

  // Find user and explicitly select password field
  const user = await User.findOne({ phoneNumber: phone });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone number not found");
  }
  console.log(user);

  // Access password field explicitly
  const userPassword = await Bcrypt.compare(password, user.password);
  console.log(userPassword);

  if (!userPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid password");
  }

  // Check if user is blocked
  if (user.status === "block") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been blocked");
  }

  // Generate token
  const token = generateToken(user._id, "user");

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
    },
  };
};

const OTPgenerator = async (req) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, "Phone number is required");
  }

  const normalizedPhone = phone.toLowerCase().trim();

  // Check if user already exists
  let user = await User.findOne({ phoneNumber: normalizedPhone });

  // Generate OTP
  const makeOtp = await generateOtp(6);
  const expire = Date.now() + 10 * 60 * 1000; // 10 minutes

  if (!user) {
    // Create new user if not exists (inactive until OTP verified)
    user = await User.create({
      phoneNumber: normalizedPhone,
      otp: makeOtp,
      otpExpire: expire,
      isVerified: false, // will be true after OTP verify
    });
  } else {
    // Update OTP for existing user
    await User.updateOne(
      { phoneNumber: normalizedPhone },
      { otp: makeOtp, otpExpire: expire }
    );
  }

  // Send OTP Email
  await sendmail.sendUserOtp({
    email: user.email || null, // fallback to null if email is not set
    OTP: makeOtp,
    name: user.name || "there", // optional
  });

  return {
    success: true,
    message: "OTP sent successfully to your email",
    // Don't return OTP in production! Only for testing
    // OTP: makeOtp,
  };
};

const Otpverify = async (req) => {
  const { otp, phone } = req.body;

  if (!phone || !otp) {
    throw new ApiError(400, "Phone number and OTP are required");
  }

  const normalizedPhone = phone.toLowerCase().trim();
  const user = await User.findOne({ phoneNumber: normalizedPhone });

  if (!user) {
    throw new ApiError(404, "No account found. Please request a new OTP.");
  }

  // Check if OTP matches
  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP. Please try again.");
  }

  // Check if OTP expired
  if (user.otpExpire < Date.now()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  // Mark user as verified (first-time or re-login)
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save({ validateBeforeSave: false });

  // Generate JWT Token
  const token = generateToken(user._id, "user");

  return {
    success: true,
    message: "Login successful!",
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name || "",
      isVerified: true,
      phoneNumber: user.phoneNumber,
    },
  };
};

// Forgot Password - Step 1: Request OTP for password reset
const forgotPassword = async (req) => {
  const { email, phoneNumber } = req.body;
  console.log(email, phoneNumber,"this is the datas");
  

  if (!email && !phoneNumber) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Email or phone number is required"
    );
  }

  const user = await User.findOne({
    $or: [
      email ? { email: email.toLowerCase().trim() } : null,
      phoneNumber ? { phoneNumber } : null,
    ].filter(Boolean),
  });
  

  // Always return same message (anti-enumeration)
  if (!user) {
    return {
      success: true,
      message:
        "If an account exists, an OTP has been sent for password reset",
    };
  }

  const makeOtp = await generateOtp(6);
  const expire = Date.now() + 10 * 60 * 1000;

  user.otp = makeOtp;
  user.otpExpire = expire;
  await user.save({ validateBeforeSave: false });

  // ✅ CRITICAL FIX: decide based on MATCHED FIELD
  const matchedByEmail =
    email && user.email === email.toLowerCase().trim();

  const matchedByPhone =
    phoneNumber && user.phoneNumber === phoneNumber;

  if (matchedByEmail) {
    await sendmail.sendUserOtp({
      email: user.email,
      OTP: makeOtp,
      purpose: "password reset",
    });
  } else if (matchedByPhone) {
    await sendmail.sendUserOtp({
      email: user.email,
      OTP: makeOtp,
      purpose: "password reset",
    });
  }

  return {
    success: true,
    message:
      "If an account exists, an OTP has been sent for password reset",
  };
};


// Verify OTP for Password Reset - Step 2
const verifyResetOtp = async (req) => {
  const { otp, email, phoneNumber } = req.body;

  if (!otp || (!email && !phoneNumber)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "OTP and email or phone number are required"
    );
  }

  let user;

  // 🔑 Identify WHICH identifier is being verified
  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    user = await User.findOne({ email: normalizedEmail });
  } else if (phoneNumber) {
    user = await User.findOne({ phoneNumber });
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid OTP or user");
  }

  // OTP check
  if (user.otp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  // Expiry check
  if (!user.otpExpire || user.otpExpire < Date.now()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");
  }

  // ✅ OTP is now VERIFIED for this identity
  const resetToken = jwt.sign(
    { id: user._id, purpose: "reset_password" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  return {
    success: true,
    message: "OTP verified successfully",
    resetToken,
    userId: user._id,
  };
};


// Final Password Reset - Step 3 (Direct reset enabled)
const resetPassword = async (req) => {
  const { token, phone, email, password } = req.body;

  if (!password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
  }

  // OTP FLOW DISABLED - Direct password reset flow is currently used.
  // Original OTP logic kept commented for future restoration.
  /*
  // If using token verification (optional)
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id !== userId || decoded.purpose !== "reset_password") {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
      }
    } catch (err) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }
  }
  */

  const user = await User.findOne({
    $or: [
      phone ? { phoneNumber: phone } : null,
      email ? { email: email.toLowerCase().trim() } : null,
    ].filter(Boolean),
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Hash new password
  const salt = await Bcrypt.genSalt(10);
  const hashedPassword = await Bcrypt.hash(password, salt);

  // Update password and clear OTP fields
  user.password = hashedPassword;
  user.confirmPassword = hashedPassword;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  return {
    success: true,
    message: "Password reset successfully",
  };
};

module.exports = {
  createUser,
  OTPgenerator,
  Otpverify,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
