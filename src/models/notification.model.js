const mongoose = require("mongoose");
const { v4 } = require("uuid");

const notificationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    sendTo: {
      type: String,
      enum: ["all", "Premium", "Admin", "Regular", "Vendors", "Guests"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
