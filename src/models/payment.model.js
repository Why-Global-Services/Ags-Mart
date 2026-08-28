const mongoose = require("mongoose");
const { v4 } = require("uuid");

const paymentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
      ref: "users",
      required: true, // ✅ ADDED: Required field
    },
    orderId: {
      type: String,
      ref: "userOrders",
      required: true, // ✅ ADDED: Required field
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // ✅ ADDED: Validation
    },
    pendingPaymentExpiry: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      },
      index: true, // ✅ ADDED: For manual cleanup queries
    },
    paymentMethod: {
      type: String,
      enum: [
        "COD",
        "RazorPay",
        "Stripe",
        "PayPal",
        "Google Pay",
        "Phone Pay",
        "Paytm",
      ],
      required: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "initiated", "refunded"],
      default: "initiated",
      index: true, // ✅ ADDED: For queries
    },
    verifiedAt: {
      type: Date,
    },
    securityChecks: {
      signatureVerified: { type: Boolean, default: false },
      amountVerified: { type: Boolean, default: false },
      expiryVerified: { type: Boolean, default: false },
      captureVerified: { type: Boolean, default: false },
    },
  },
  {
    collection: "Payment",
    timestamps: true,
  }
);

// ✅ FIXED: Single TTL index with proper configuration
paymentSchema.index(
  { pendingPaymentExpiry: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      paymentStatus: { $in: ["initiated", "pending"] },
      pendingPaymentExpiry: { $exists: true, $ne: null },
    },
  }
);

// ✅ Performance indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ orderId: 1 }, { unique: true });

// ✅ ADDED: Pre-save middleware for validation
paymentSchema.pre("save", function (next) {
  if (this.paymentStatus === "paid" && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }
  next();
});

const paymentDetailsModel = mongoose.model("Payment", paymentSchema);
module.exports = { paymentDetailsModel };
