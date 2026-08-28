const mongoose = require("mongoose");
const { v4 } = require("uuid");

const offersSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    offerImage: {
      type: String,
      required: true,
    },
    offerTitle: {
      type: String,
      required: true,
    },
    offerTerms: {
      type: String,
    },
    keyWords: {
      type: String,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "offers",
  }
);

const offers = mongoose.model("offers", offersSchema);

module.exports = {
  offers,
};
