const { string, number } = require("joi");
const mongoose = require("mongoose");
const { v4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: false, // to prevent duplicates
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: false,
    },
    confirmPassword: {
      type: String,
      required: false,
    },
    otp: {
      type: String,
    },
    otpExpire: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    status: {
      type: String,
      enum: ["block", "unblock"],
      default: "unblock",
    },
    address: [
      {
        fullName: String,
        addressLine1: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        phone: String,
        landMark: String,
        addressType: {
          type: String,
          // enum: ["work", "home", "WORK", "HOME"],
          default: "home",
        },
        checkoutAddress: {
          type: String,
          // enum: ["billingAddress", "deliveryAddress"],
          default: "billingAddress",
        },
        _id: {
          type: String,
          default: v4,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
module.exports = {
  User,
};
