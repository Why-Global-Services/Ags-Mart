const mongoose = require("mongoose");
const { v4 } = require("uuid");

const shippingMethodSchema = new mongoose.Schema({
  _id: { type: String, default: v4 },
  localDelivery: { type: Boolean, default: false },
  standard: { type: Boolean, default: false },
  webhookUrl: { type: String, default: "" },
  webhookToken: { type: String, default: "" },

  email: { type: String, required: true }, 
  password: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model("ShippingMethod", shippingMethodSchema);