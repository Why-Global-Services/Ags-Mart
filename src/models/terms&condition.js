const mongoose = require("mongoose");
const { v4 } = require("uuid");

const TermsandCondition = new mongoose.Schema({
  _id: { type: String, default: v4 },
  acceptanceOfTermsTitle: { type: String, required: true },
  acceptanceOfTermsContent: { type: String, required: true },
  userAccountsRegistrationTitle: { type: String, required: true },
  userAccountsRegistrationContent: { type: String, required: true },
  productInformationTitle: { type: String, required: true },
  productInformationContent: { type: String, required: true },
  purchasePaymentTitle: { type: String, required: true },
  purchasePaymentContent: { type: String, required: true },
  intellectualPropertyTitle: { type: String, required: true },
  intellectualPropertyContent: { type: String, required: true },
  disclaimersLimitationsTitle: { type: String, required: true },
  disclaimersLimitationsContent: { type: String, required: true },
  governingLawTitle: { type: String, required: true },
  governingLawContent: { type: String, required: true },
},{
  timestamps: true,
  collection: "TermsAndCondition"
});

module.exports = mongoose.model("TermsAndCondition", TermsandCondition);