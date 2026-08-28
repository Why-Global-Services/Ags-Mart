const mongoose = require("mongoose");
const { v4 } = require("uuid");

const wishlist = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
      default: null
    },
    guestId: {
      type: String,
      default: null
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
        required: true,
      },
      variantType: {
        type: String,
      },
      _id: {type: String, default: v4}
    }
    ],
  },
  { timestamps: true }
);

const wishlistSchema = mongoose.model("wishlist", wishlist);

module.exports = {
  wishlistSchema,
};
