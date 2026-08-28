const mongoose = require("mongoose");
const { v4 } = require("uuid");

const saveLaterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    items: [
      {
      productId: {
        type: String,
        required: true
      },
      variantId: {
        type: String,
        required: true
      },
      productType: {
        type: String,
        enum: ["variation", "nonVariation"],
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    }
    ],
  },
  { timestamp: true,
    collection: "SaveLater"
  }
);

const saveLater = mongoose.model("SaveLater", saveLaterSchema);

module.exports = { saveLater };
