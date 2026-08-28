const mongoose = require("mongoose");
const { v4 } = require("uuid");

const CartSchema = new mongoose.Schema(
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
          type: String, // Main product ID (e.g., "2969db0e-98f0...")
          required: true,
        },
        variantId: {
          type: String, // Either a variantId (like "9f4b2b05-...") OR nonVarientId ("681b405087...") depending on type
          required: true,
        },
        productType: {
          type: String,
          // enum: ["variation", "nonVariation"],
          required: true,
        },
        variantType: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        _id: {
          type: String,
          default: v4,
        },
      },
    ],
    deliveryAddressId: {
      type: String,
    },
    billingAddressId: {
      type: String,
    },
  },
  { timestamps: true }
);

const cart = mongoose.model("Cart", CartSchema);

module.exports = { cart };
