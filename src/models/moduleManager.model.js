const mongoose = require("mongoose");
const { v4 } = require("uuid");

const moduleManagerSchema = new mongoose.Schema({
  _id: { type: String, default: v4 },
  dashboard: { type: Boolean },
  products: { type: Boolean },
  categories: { type: Boolean },
  subCategories: { type: Boolean },
  orders: { type: Boolean },
  customers: { type: Boolean },
  reviews: { type: Boolean },
  offers: { type: Boolean },
  brand: { type: Boolean },
  coupons: { type: Boolean },
  featureSection: { type: Boolean },
  reports: { type: Boolean },
  profile: { type: Boolean },
  systemUser: { type: Boolean },
  notification: { type: Boolean },
});

const moduleManager = mongoose.model("ModuleManager", moduleManagerSchema);

module.exports = { moduleManager };
