const express = require("express");
const router = express.Router();
const shippingController = require("../../controller/shipping.controller");

// Shiprocket Webhook Endpoint - Authenticated via x-api-key header and SHIPROCKET_WEBHOOK_TOKEN
router
  .route("/webhook")
  .post(shippingController.handleWebhook)
  .get(shippingController.validateWebhookEndpoint)
  .head(shippingController.validateWebhookEndpoint);

// Shipping tracking and sync endpoints
router.route("/track/:orderId").get(shippingController.trackOrder);
router.route("/sync/:orderId").post(shippingController.syncOrder);

// Shipping dynamic rate estimate endpoints
router.route("/estimate").post(shippingController.getShippingEstimate);
router.route("/rate").post(shippingController.getShippingEstimate);

module.exports = router;
