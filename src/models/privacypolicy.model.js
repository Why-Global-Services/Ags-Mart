const mongoose = require("mongoose");
const { v4 } = require("uuid");

const Privacypolicy = new mongoose.Schema({
  _id: { type: String, default: v4 },
  introductionTitle: { type: String, required: true },
  introductionContent: { type: String, required: true },
  informationCollectionTitle: { type: String, required: true },
  informationCollectionContent: { type: String, required: true },
  useOfInformationTitle: { type: String, required: true },
  useOfInformationContent: { type: String, required: true },
  informationSharingTitle: { type: String, required: true },
  informationSharingContent: { type: String, required: true },
  yourRightsTitle: { type: String, required: true },
  yourRightsContent: { type: String, required: true },
  dataSecurityTitle: { type: String, required: true },
  dataSecurityContent: { type: String, required: true },
  childrensPrivacyTitle: { type: String, required: true },
  childrensPrivacyContent: { type: String, required: true },
  changesToPolicyTitle: { type: String, required: true },
  changesToPolicyContent: { type: String, required: true },
  contactUsTitle: { type: String, required: true },
  contactUsContent: { type: String, required: true }
},{
  timestamps: true,
  collection: "privacyPolicy"
});

module.exports = mongoose.model("PrivacyPolicy", Privacypolicy);