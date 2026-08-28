const mongoose = require("mongoose");
const { v4 } = require("uuid");

const ReturnPolicy = new mongoose.Schema({
  _id: { type: String, default: v4 },
  ourReturnPolicy: { type: String, required: true },
  ourReturnPolicyContent: { type: String, required: true },
  eligibilityForReturns: { type: String, required: true },
  eligibilityForReturnsContent: { type: String, required: true },
  howToReturnAnItem: { type: String, required: true },
  howToReturnAnItemContent: { type: String, required: true },
  refundProcess: { type: String, required: true },
  refundProcessContent: { type: String, required: true },
  returnShipping: { type: String, required: true },
  returnShippingContent: { type: String, required: true }
},{
  timestamps: true, 
  collection:"returnPolicy" 
});

module.exports = mongoose.model("ReturnPolicy", ReturnPolicy);