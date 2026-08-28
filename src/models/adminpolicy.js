const mongoose = require("mongoose");
const { v4 } = require("uuid");

const AdminPolicy = new mongoose.Schema({
  _id: { type: String, default: v4 },
  introductionTitle: { type: String, required: true },
  introductionContent: { type:String, required: true },
  accountManagementTitle: { type: String, required: true },
  accountManagementContent: { type:String, required: true },
  userConductTitle: { type: String, required: true },
  userConductContent: { type:String, required: true },
  orderProcessingTitle: { type: String, required: true },
  orderProcessingContent: { type:String, required: true },
  disputeResolutionTitle: { type: String, required: true },
  disputeResolutionContent: { type:String, required: true },
  accountVerificationTitle: { type: String, required: true },
  accountVerificationContent: { type:String, required: true },
  policyEnforcementTitle: { type: String, required: true },
  policyEnforcementContent: { type:String, required: true },
  changesToPolicyTitle: { type: String, required: true },
  changesToPolicyContent: { type:String, required: true },
  contactUsTitle: { type: String, required: true },
  contactUsContent: { type:String, required: true }
},{
  timestamps: true,
  collection: "adminPolicy"
});

module.exports = mongoose.model("adminPolicy", AdminPolicy);