const mongoose = require("mongoose");
const { v4 } = require("uuid");

const orderNotificationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
    },
    eventKey: {
      type: String,
      required: true,
      unique: true, // Guarantees database-level atomic idempotency
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: "Valued Customer",
    },
    subject: {
      type: String,
      required: true,
    },
    shipmentDetails: {
      awbCode: String,
      courierName: String,
      trackingUrl: String,
      shipmentId: String,
    },
    notificationState: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "order_notifications",
  }
);

// Compound index for idempotency and query efficiency
orderNotificationSchema.index({ orderId: 1, status: 1 });

const OrderNotification = mongoose.model(
  "OrderNotification",
  orderNotificationSchema
);

module.exports = {
  OrderNotification,
};
