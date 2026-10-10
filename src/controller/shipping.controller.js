const catchAsync = require("../utils/catchAsync");
const shippingService = require("../services/shipping.service");

const handleWebhook = catchAsync(async (req, res) => {
  const result = await shippingService.handleShiprocketWebhook(req);
  res.status(result.statusCode || 200).send(result);
});

const trackOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const result = await shippingService.syncOrderTracking(orderId);
  res.status(200).send(result);
});

const syncOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const result = await shippingService.syncOrderTracking(orderId);
  res.status(200).send(result);
});

const validateWebhookEndpoint = catchAsync(async (req, res) => {
  const result = shippingService.validateWebhookEndpoint(req);
  res.status(result.statusCode || 200).send(result);
});

const getShippingEstimate = catchAsync(async (req, res) => {
  const result = await shippingService.getShippingEstimateHandler(req);
  res.status(result.statusCode || 200).send(result);
});

module.exports = {
  handleWebhook,
  trackOrder,
  syncOrder,
  validateWebhookEndpoint,
  getShippingEstimate,
};
