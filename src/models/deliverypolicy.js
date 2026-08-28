const mongoose = require("mongoose");
const { v4 } = require("uuid");

const DeliveryPolicy = new mongoose.Schema({
  _id: { type: String, default: v4 },
  introductionTitle: { type: String, required: true },
  introductionContent: { type: String, required: true },
  shippingMethodsTitle: { type: String, required: true },
  shippingMethodsContent: { type: String, required: true },
  orderProcessingTimesTitle: { type: String, required: true },
  orderProcessingTimesContent: { type: String, required: true },
  shippingCostsTitle: { type: String, required: true },
  shippingCostsContent: { type: String, required: true },
  internationalShippingTitle: { type: String, required: true },
  internationalShippingContent: { type: String, required: true },
  deliveryIssuesTitle: { type: String, required: true },
  deliveryIssuesContent: { type: String, required: true },
  returnsAndExchangesTitle: { type: String, required: true },
  returnsAndExchangesContent: { type: String, required: true },
  orderTrackingTitle: { type: String, required: true },
  orderTrackingContent: { type: String, required: true },
  changesToPolicyTitle: { type: String, required: true },
  changesToPolicyContent: { type: String, required: true },
  contactUsTitle: { type: String, required: true },
  contactUsContent: { type: String, required: true }
},{
  timestamps: true,
  collection: "deliveryPolicy"
});

module.exports = mongoose.model("DeliveryPolicy", DeliveryPolicy);