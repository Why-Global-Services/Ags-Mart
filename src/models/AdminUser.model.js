const mongoose = require("mongoose");
const { v4 } = require("uuid");

const adminSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "Admin",
    },
    userRole: {
      type: String,
      enum: ["super_admin", "admin", "manager", "employee", "support"],
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    additionalEmail: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
    },
    otpExpire: {
      type: String,
    },
    Address: {
      type: String,
      default: null,
    },
    permissions: {
      products: { type: Boolean, default: false },
      category: { type: Boolean, default: false },
      subCategory: { type: Boolean, default: false },
      orders: { type: Boolean, default: false },
      customers: { type: Boolean, default: false },
      reviews: { type: Boolean, default: false },
      offers: { type: Boolean, default: false },
      brands: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      profile: { type: Boolean, default: false },
      notifications: { type: Boolean, default: false },
      systemUser: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "admin",
  }
);

const admin = mongoose.model("Admins", adminSchema);

module.exports = {
  admin,
};
