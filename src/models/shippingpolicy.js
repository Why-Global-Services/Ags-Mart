const mongoose = require("mongoose");
const { v4 } = require("uuid");

const CustomSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    titleField: { type: String, required: true },
    contentField: { type: String, required: true },
    title: { type: String, default: "" },
    content: { type: String, default: "" },
  },
  { _id: false }
);

const ShippingPolicy = new mongoose.Schema(
  {
    _id: { type: String, default: v4 },
    processingTimeTitle: { type: String, default: "Processing Time" },
    processingTimeContent: { type: String, default: "" },
    domesticShippingTitle: { type: String, default: "Domestic Shipping" },
    domesticShippingContent: { type: String, default: "" },
    orderTrackingTitle: { type: String, default: "Order Tracking" },
    orderTrackingContent: { type: String, default: "" },
    shippingRestrictionsTitle: { type: String, default: "Shipping Restrictions" },
    shippingRestrictionsContent: { type: String, default: "" },
    cashOnDeliveryTitle: { type: String, default: "Cash on Delivery" },
    cashOnDeliveryContent: { type: String, default: "" },
    damagedOrLostPackagesTitle: { type: String, default: "Damaged or Lost Packages" },
    damagedOrLostPackagesContent: { type: String, default: "" },
    contactUsTitle: { type: String, default: "Contact Us" },
    contactUsContent: { type: String, default: "" },
    customSections: { type: [CustomSectionSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "ShippingPolicy",
  }
);

module.exports = mongoose.model("ShippingPolicy", ShippingPolicy);
