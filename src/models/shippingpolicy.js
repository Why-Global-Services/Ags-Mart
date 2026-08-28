const mongoose = require("mongoose");
const { v4 } = require("uuid");

const ShippingPolicy = new mongoose.Schema({
  _id: { type: String, default: v4 },
  processingTimeTitle: { type: String, required: true },
  processingTimeContent: { type: String, required: true },
  domesticShippingTitle: { type: String, required: true },
  domesticShippingContent: { type: String, required: true },
  orderTrackingTitle: { type: String, required: true },
  orderTrackingContent: { type: String, required: true },
  shippingRestrictionsTitle: { type: String, required: true },
  shippingRestrictionsContent: { type: String, required: true },
  cashOnDeliveryTitle: { type: String, required: true },
  cashOnDeliveryContent: { type: String, required: true },
  damagedOrLostPackagesTitle: { type: String, required: true },
  damagedOrLostPackagesContent: { type: String, required: true },
  contactUsTitle: { type: String, required: true },
  contactUsContent: { type: String, required: true }
},{
  timestamps: true,
  collection: "ShippingPolicy"
});

module.exports = mongoose.model("ShippingPolicy", ShippingPolicy);