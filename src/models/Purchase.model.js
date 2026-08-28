const mongoose = require("mongoose");
const { v4 } = require("uuid");

const PurchaseCodeSchema = new mongoose.Schema({
  _id: { type: String, default: v4 },
  purchaseCodeWeb: {
    type: String,
  },
  purchaseCodePhone: {
    type: String,
  },
});

const PurchaseCode = mongoose.model("PurchaseCode", PurchaseCodeSchema);

module.exports = { PurchaseCode };
