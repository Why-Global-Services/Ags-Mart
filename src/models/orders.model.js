const mongoose = require("mongoose");
const { v4 } = require("uuid");

const AddressSchema = new mongoose.Schema({
  _id: String,
  fullName: String,
  addressLine1: String,
  phone: String,
  street: String,
  city: String,
  zipCode: String,
  landMark: String,
  state: String,
  country: String,
  addressType: String,
  checkoutAddress: String,
});

const orderDetailsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      ref: "users",
      required: true,
    },
    email: {
      type: String,
    },
    userName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    isBuyNow: {
      type: Boolean,
      default: false,
    },

    orderDetails: [
      {
        products: [
          {
            productId: {
              type: String,
              required: true,
            },
            variantId: {
              type: String,
            },
            productType: {
              type: String,
              enum: ["variation", "nonVariation", "variant", "nonVariant"],
            },
            quantity: {
              type: Number,
              required: true,
            },
            price: {
              type: Number,
              required: true,
            },
            customizationCost: {
              type: Number,
              default: 0,
            },
            isFormElement: {
              type: Boolean,
              default: false,
            },
            customization: {
              type: mongoose.Schema.Types.Mixed,
              default: null,
            },
            subtotal: {
              type: Number,
              required: true,
            },
            orderStatus: {
              type: String,
              enum: [
                "Pending",
                "Ordered",
                "Packing",
                "Shipped",
                "Delivered",
                "Cancelled",
                "Return Request",
                "Returned",
                "Partial",
              ],
              default: "Pending",
            },
            paymentStatus: {
              type: String,
              enum: ["Pending", "Completed", "Refunded", "Failed", "Partial"],
              default: "Pending",
            },
            returnStatus: {
              type: String,
              enum: ["Request", "In Process", "Approved", "Rejected", "Cancelled"],
              default: null,
            },
            returnReason: {
              type: String,
              default: null,
            },
            returnImage: {
              type: String,
              default: null,
            },
          },
        ],
        cartQuantity: {
          type: Number,
          required: true,
        },
        couponCode: {
          type: String,
          default: null,
        },
        couponDetails: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
        taxAmount: {
          type: Number,
          default: 0,
        },
        finalAmount: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
    },
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Ordered",
        "Packing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Return Request",
        "Returned",
        "Partial",
      ],
      default: "Pending",
    },
    returnStatus: {
      type: String,
      enum: ["Pending", "In Process", "Approved", "Rejected", "Cancelled"],
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Refunded", "Failed", "Partial"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: [
        "COD",
        "Bank Transfer",
        "RazorPay",
        "Google Pay",
        "PayPal",
        "Phone Pay",
        "Paytm",
        "Stripe",
      ],
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    returnImage: {
      type: String,
      default: null,
    },
    deliveryAddress: {
      type: AddressSchema,
      required: true,
    },
    billingAddress: {
      type: AddressSchema,
      required: true,
    },

    // ✅ UPDATED: Proper TTL implementation
    expiresAt: {
      type: Date,
      default: function () {
        // Set expiry based on order status
        if (this.orderStatus === "Pending") {
          return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes for pending orders
        }
        return null; // No expiry for confirmed orders
      },
    },

    // ✅ ADDED: Track order lifecycle
    orderPlacedAt: {
      type: Date,
      default: Date.now,
    },
    orderConfirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// ✅ CRITICAL: Create TTL index for automatic deletion
orderDetailsSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0, // Delete documents when expiresAt time is reached
    partialFilterExpression: {
      orderStatus: "Pending", // Only apply to pending orders
      expiresAt: { $exists: true }, // Only if expiresAt exists
    },
  }
);

// ✅ Additional indexes for performance
orderDetailsSchema.index({ userId: 1, createdAt: -1 });
orderDetailsSchema.index({ orderId: 1 });
orderDetailsSchema.index({ paymentStatus: 1, orderStatus: 1 });
orderDetailsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const orderDetailsModel = mongoose.model("orders", orderDetailsSchema);

module.exports = {
  orderDetailsModel,
};
