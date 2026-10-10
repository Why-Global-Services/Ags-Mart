const httpStatus = require("http-status");
const { orderDetailsModel } = require("../models/orders.model");
const { Product } = require("../models/Product.model");
const { cart } = require("../models/cart.model");
const { CouponModel } = require("../models/coupons.model");
const { User } = require("../models/users.model");
const ApiError = require("../utils/apiError");
const config = require("../config/config");
const logger = require("../config/logger");
const sendmail = require("../utils/sendmail");
const {
  trackShipment,
  calculateShipmentDimensions,
  getShippingRateEstimate,
  getPickupPincode,
} = require("../utils/shiprocket");

/**
 * Progression rank for normal order fulfillment lifecycle.
 * Higher rank means later in the fulfillment flow.
 */
const STATUS_RANK = {
  Pending: 0,
  Ordered: 1,
  Packing: 2,
  Shipped: 3,
  Delivered: 4,
};

/**
 * Extracts incoming token from multiple header variations:
 * x-api-key, x_api_key, x-webhook-token, x_webhook_token, authorization (Bearer)
 * @param {object} headers
 * @returns {string}
 */
const getIncomingToken = (input = {}) => {
  const headers = input?.headers || input || {};
  const token =
    headers["x-api-key"] ||
    headers["x_api_key"] ||
    headers["x-webhook-token"] ||
    headers["x_webhook_token"] ||
    headers["authorization"] ||
    "";

  return token.replace(/^Bearer\s+/i, "").trim();
};

/**
 * Validate incoming webhook API key against configured SHIPROCKET_WEBHOOK_TOKEN.
 * @param {string} apiKey - Header value (x-api-key)
 * @returns {boolean}
 */
const validateWebhookToken = (apiKey) => {
  const configuredToken =
    process.env.SHIPROCKET_WEBHOOK_TOKEN || config.shiprocket?.webhookToken;

  if (!configuredToken || !apiKey) {
    return false;
  }

  return apiKey.trim() === configuredToken.trim();
};

/**
 * Extracts identifiers and shipping attributes from various Shiprocket webhook payload formats.
 * @param {object} body - Request body
 * @returns {object}
 */
const extractPayload = (body) => {
  const data = body?.data || body?.shipment || body?.payload || body || {};

  const awb =
    data.awb ||
    data.awb_code ||
    data.awbCode ||
    data.tracking_number ||
    body.awb ||
    body.awb_code ||
    null;

  const shipmentId =
    data.shipment_id ||
    data.shipmentId ||
    data.shipment ||
    body.shipment_id ||
    body.shipmentId ||
    null;

  const srOrderId =
    data.order_id ||
    data.sr_order_id ||
    data.shiprocket_order_id ||
    body.order_id ||
    null;

  const channelOrderId =
    data.channel_order_id ||
    data.channelOrderId ||
    data.reference_id ||
    data.channel_order ||
    body.channel_order_id ||
    null;

  const rawStatus =
    data.current_status ||
    data.status ||
    data.shipment_status ||
    body.current_status ||
    body.status ||
    null;

  const courierName =
    data.courier_name ||
    data.courier ||
    data.courier_company_id ||
    body.courier_name ||
    null;

  const trackingUrl =
    data.tracking_url ||
    data.trackingUrl ||
    data.channel_order_id_url ||
    body.tracking_url ||
    null;

  const eventTimestamp =
    data.current_timestamp ||
    data.timestamp ||
    data.scans?.[0]?.date ||
    data.updated_at ||
    body.current_timestamp ||
    new Date();

  return {
    awb: awb ? String(awb).trim() : null,
    shipmentId: shipmentId ? String(shipmentId).trim() : null,
    srOrderId: srOrderId ? String(srOrderId).trim() : null,
    channelOrderId: channelOrderId ? String(channelOrderId).trim() : null,
    rawStatus: rawStatus ? String(rawStatus).trim() : null,
    courierName: courierName ? String(courierName).trim() : null,
    trackingUrl: trackingUrl ? String(trackingUrl).trim() : null,
    eventTimestamp,
  };
};

/**
 * Maps raw Shiprocket status string to AGS-Mart orderStatus enum value.
 * Enum: ["Pending", "Ordered", "Packing", "Shipped", "Delivered", "Cancelled", "Return Request", "Returned", "Partial"]
 * @param {string} rawStatus
 * @returns {string|null}
 */
const mapShiprocketStatus = (rawStatus) => {
  if (!rawStatus || typeof rawStatus !== "string") {
    return null;
  }

  const s = rawStatus.toUpperCase().trim();

  // Cancelled statuses
  if (s === "CANCELLED" || s === "CANCELED" || s.includes("CANCELLATION")) {
    return "Cancelled";
  }

  // Return / RTO statuses
  if (
    s.startsWith("RTO") ||
    s.includes("RETURN") ||
    s.includes("UNDELIVERED") ||
    s === "LOST" ||
    s === "DAMAGED"
  ) {
    return "Returned";
  }

  // Delivered
  if (s === "DELIVERED" || s.includes("DELIVERED")) {
    return "Delivered";
  }

  // Shipped / In Transit / Out for delivery
  if (
    s === "SHIPPED" ||
    s === "IN TRANSIT" ||
    s === "IN-TRANSIT" ||
    s === "PICKED UP" ||
    s === "PICKUP DONE" ||
    s === "OUT FOR DELIVERY" ||
    s === "OUT FOR PICKUP" ||
    s === "REACHED AT DESTINATION" ||
    s === "DISPATCHED" ||
    s === "HANDOVER" ||
    s.includes("TRANSIT")
  ) {
    return "Shipped";
  }

  // Packing / Order confirmed / Manifested / Ready to ship
  if (
    s === "NEW" ||
    s === "ORDER CONFIRMED" ||
    s === "PICKUP SCHEDULED" ||
    s === "PICKUP QUEUED" ||
    s === "MANIFEST GENERATED" ||
    s === "PROCESSING" ||
    s === "READY TO SHIP" ||
    s === "CONFIRMED"
  ) {
    return "Packing";
  }

  return null;
};

/**
 * Determines whether a status transition is valid according to business rules,
 * preserving terminal states and preventing out-of-order event regression.
 * @param {string} currentStatus
 * @param {string} newMappedStatus
 * @returns {boolean}
 */
const canTransitionStatus = (currentStatus, newMappedStatus) => {
  if (!newMappedStatus) return false;
  if (currentStatus === newMappedStatus) return false;

  // Terminal state 1: Cancelled cannot be overturned by shipment status updates
  if (currentStatus === "Cancelled") {
    return false;
  }

  // Terminal state 2: Returned cannot be overturned by previous in-transit events
  if (currentStatus === "Returned") {
    return false;
  }

  // Terminal state 3: Delivered can only transition to Returned or Cancelled
  if (currentStatus === "Delivered") {
    return newMappedStatus === "Returned" || newMappedStatus === "Cancelled";
  }

  // Normal progression: prevent older/lower rank events from overwriting newer states
  const currentRank = STATUS_RANK[currentStatus];
  const newRank = STATUS_RANK[newMappedStatus];

  if (currentRank !== undefined && newRank !== undefined) {
    return newRank > currentRank;
  }

  // Transitions to Cancelled or Returned are allowed from any active state
  if (newMappedStatus === "Cancelled" || newMappedStatus === "Returned") {
    return true;
  }

  return false;
};

/**
 * Handle incoming Shiprocket webhook.
 * Authenticates, finds order by multiple identifiers, safely applies status updates,
 * and handles idempotence.
 * @param {object} req - Express request
 * @returns {object}
 */
const handleShiprocketWebhook = async (req) => {
  const incomingToken = getIncomingToken(req.headers);

  if (!validateWebhookToken(incomingToken)) {
    logger.warn("Unauthorized Shiprocket webhook attempt: invalid or missing authentication header");
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: Missing or invalid webhook token"
    );
  }

  const {
    awb,
    shipmentId,
    srOrderId,
    channelOrderId,
    rawStatus,
    courierName,
    trackingUrl,
    eventTimestamp,
  } = extractPayload(req.body);

  // Build match query across all available identifiers
  const matchConditions = [];
  if (channelOrderId) {
    matchConditions.push({ orderId: channelOrderId });
  }
  if (shipmentId) {
    matchConditions.push({ "shiprocket.shipmentId": shipmentId });
  }
  if (awb) {
    matchConditions.push({ "shiprocket.awbCode": awb });
  }
  if (srOrderId) {
    matchConditions.push({ "shiprocket.orderId": srOrderId });
    matchConditions.push({ orderId: srOrderId });
  }

  if (matchConditions.length === 0) {
    logger.warn("Shiprocket webhook received with no recognizable order/shipment identifiers (test or sample ping)");
    return {
      success: true,
      statusCode: httpStatus.OK,
      message: "Webhook received: No shipment or order identifiers present in payload",
      matched: false,
    };
  }

  const order = await orderDetailsModel.findOne({ $or: matchConditions });

  if (!order) {
    logger.warn("Shiprocket webhook: No matching order found in local database (test or unrecorded order)", {
      channelOrderId: channelOrderId || "N/A",
      shipmentId: shipmentId || "N/A",
      awb: awb || "N/A",
      srOrderId: srOrderId || "N/A",
      rawStatus: rawStatus || "N/A",
    });
    return {
      success: true,
      statusCode: httpStatus.OK,
      message: "Webhook processed: No matching order found in local database",
      matched: false,
      identifiers: {
        channelOrderId,
        shipmentId,
        awb,
        srOrderId,
      },
    };
  }

  const currentStatus = order.orderStatus;
  const mappedStatus = mapShiprocketStatus(rawStatus);

  // Determine if status should transition
  const shouldTransition = canTransitionStatus(currentStatus, mappedStatus);
  const targetOrderStatus = shouldTransition ? mappedStatus : currentStatus;

  // Prepare order updates
  const updateFields = {
    "shiprocket.status": rawStatus || order.shiprocket?.status,
    updatedAt: new Date(),
  };

  if (shouldTransition) {
    updateFields.orderStatus = targetOrderStatus;

    if (targetOrderStatus === "Delivered") {
      // If order was COD and pending payment, mark as completed upon delivery
      if (order.paymentMethod === "COD" && order.paymentStatus === "Pending") {
        updateFields.paymentStatus = "Completed";
      }
    }
  }

  if (awb && order.shiprocket?.awbCode !== awb) {
    updateFields["shiprocket.awbCode"] = awb;
  }
  if (courierName && order.shiprocket?.courierName !== courierName) {
    updateFields["shiprocket.courierName"] = courierName;
  }
  if (trackingUrl && order.shiprocket?.trackingUrl !== trackingUrl) {
    updateFields["shiprocket.trackingUrl"] = trackingUrl;
  }
  if (shipmentId && !order.shiprocket?.shipmentId) {
    updateFields["shiprocket.shipmentId"] = shipmentId;
  }
  if (srOrderId && !order.shiprocket?.orderId) {
    updateFields["shiprocket.orderId"] = srOrderId;
  }

  // Update order document
  const updatedOrder = await orderDetailsModel.findOneAndUpdate(
    { _id: order._id },
    { $set: updateFields },
    { new: true }
  );

  // If orderStatus changed, update non-return product items accordingly
  if (
    shouldTransition &&
    targetOrderStatus &&
    !["Return Request", "Returned", "Partial"].includes(targetOrderStatus)
  ) {
    await orderDetailsModel.updateOne(
      { _id: order._id },
      {
        $set: {
          "orderDetails.$[].products.$[elem].orderStatus": targetOrderStatus,
        },
      },
      {
        arrayFilters: [
          {
            "elem.returnStatus": { $nin: ["Request", "In Process", "Approved"] },
          },
        ],
      }
    );
  }

  // Send customer order status email if status transitioned or changed
  if (shouldTransition && targetOrderStatus) {
    try {
      const eventId = rawAwb || order.shiprocket?.awbCode || order.shiprocket?.shipmentId || undefined;
      await sendmail.sendOrderStatusEmail({
        order: updatedOrder,
        status: targetOrderStatus,
        eventIdentifier: eventId,
        courierName: updatedOrder.shiprocket?.courierName,
        awbCode: updatedOrder.shiprocket?.awbCode,
        trackingUrl: updatedOrder.shiprocket?.trackingUrl,
      });
    } catch (mailErr) {
      logger.error("Failed to send customer order status email from webhook", {
        orderId: order.orderId,
        status: targetOrderStatus,
        error: mailErr.message,
      });
    }
  }

  logger.info("Shiprocket webhook processed successfully", {
    orderId: order.orderId,
    previousStatus: currentStatus,
    newStatus: targetOrderStatus,
    rawStatus,
    awb: updateFields["shiprocket.awbCode"] || order.shiprocket?.awbCode,
    isTransitioned: shouldTransition,
  });

  return {
    success: true,
    matched: true,
    statusCode: httpStatus.OK,
    message: shouldTransition
      ? `Order status updated to ${targetOrderStatus}`
      : "Order shipping details updated (idempotent / status preserved)",
    data: {
      orderId: order.orderId,
      orderStatus: targetOrderStatus,
      shippingStatus: rawStatus || order.shiprocket?.status,
      awbCode: updatedOrder.shiprocket?.awbCode,
      courierName: updatedOrder.shiprocket?.courierName,
      trackingUrl: updatedOrder.shiprocket?.trackingUrl,
      shipmentId: updatedOrder.shiprocket?.shipmentId,
    },
  };
};

/**
 * Manual tracking sync for a given orderId.
 * Calls Shiprocket API and updates order in DB if updated.
 * @param {string} orderId
 * @returns {object}
 */
const syncOrderTracking = async (orderId) => {
  const order = await orderDetailsModel.findOne({ orderId });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  const shipmentId = order.shiprocket?.shipmentId;
  if (!shipmentId) {
    return {
      success: true,
      message: "Order has no Shiprocket shipment ID yet",
      data: order,
    };
  }

  try {
    const trackData = await trackShipment(shipmentId);
    const trackingInfo =
      trackData?.tracking_data?.shipment_track?.[0] ||
      trackData?.tracking_data ||
      {};

    const rawStatus =
      trackingInfo.current_status ||
      trackingInfo.status ||
      trackData?.current_status;
    const awb = trackingInfo.awb_code || trackData?.awb_code;
    const courier = trackingInfo.courier_name || trackData?.courier_name;
    const trackUrl =
      trackData?.tracking_data?.track_url ||
      trackingInfo.track_url ||
      order.shiprocket?.trackingUrl;

    const mappedStatus = mapShiprocketStatus(rawStatus);
    const shouldTransition = canTransitionStatus(order.orderStatus, mappedStatus);
    const targetStatus = shouldTransition ? mappedStatus : order.orderStatus;

    const updateFields = {
      "shiprocket.status": rawStatus || order.shiprocket?.status,
      updatedAt: new Date(),
    };

    if (shouldTransition) {
      updateFields.orderStatus = targetStatus;
    }
    if (awb) updateFields["shiprocket.awbCode"] = awb;
    if (courier) updateFields["shiprocket.courierName"] = courier;
    if (trackUrl) updateFields["shiprocket.trackingUrl"] = trackUrl;

    const updated = await orderDetailsModel.findOneAndUpdate(
      { orderId },
      { $set: updateFields },
      { new: true }
    );

    if (shouldTransition && targetStatus) {
      try {
        await sendmail.sendOrderStatusEmail({
          order: updated,
          status: targetStatus,
          eventIdentifier: awb || order.shiprocket?.shipmentId || undefined,
          courierName: courier || updated?.shiprocket?.courierName,
          awbCode: awb || updated?.shiprocket?.awbCode,
          trackingUrl: trackUrl || updated?.shiprocket?.trackingUrl,
        });
      } catch (mailErr) {
        logger.error("Failed to send customer order status email from syncOrderTracking", {
          orderId,
          status: targetStatus,
          error: mailErr.message,
        });
      }
    }

    return {
      success: true,
      message: "Order tracking synced successfully",
      data: updated,
    };
  } catch (error) {
    logger.error("Failed to sync Shiprocket tracking for order", {
      orderId,
      error: error.message,
    });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to sync tracking: ${error.message}`
    );
  }
};

/**
 * Validate webhook endpoint for Shiprocket dashboard check (GET/HEAD requests).
 * @param {object} req - Express request
 * @returns {object}
 */
const validateWebhookEndpoint = (req) => {
  const token = getIncomingToken(req);
  if (!validateWebhookToken(token)) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized: Invalid or missing webhook token"
    );
  }
  return {
    success: true,
    statusCode: httpStatus.OK,
    message: "Shiprocket webhook endpoint is active and authenticated",
  };
};

/**
 * Shared authoritative pricing and dynamic shipping calculation.
 * Dynamically calculates rates via Shiprocket courier serviceability API for all orders.
 * Falls back gracefully to DEFAULT_SHIPPING_CHARGE (50) on error or unserviceable address.
 *
 * @param {object} params
 * @param {string} [params.userId]
 * @param {string} [params.deliveryPincode]
 * @param {string} [params.deliveryAddressId]
 * @param {string} [params.paymentMethod="COD"]
 * @param {string} [params.couponCode]
 * @param {boolean} [params.isBuyNow=false]
 * @param {object} [params.buyNowItem]
 * @param {Array} [params.cartItems]
 * @param {number} [params.subtotalOverride]
 * @returns {Promise<object>}
 */
const calculateOrderShippingAndPricing = async (params = {}) => {
  const {
    userId,
    deliveryAddressId,
    paymentMethod = "COD",
    couponCode = null,
    isBuyNow = false,
    buyNowItem = null,
    subtotalOverride = null,
  } = params;

  let cleanDeliveryPin = params.deliveryPincode
    ? String(params.deliveryPincode).trim()
    : null;

  // Resolve delivery pincode from saved address if not directly supplied
  if (!cleanDeliveryPin && userId) {
    try {
      const userDoc = await User.findById(userId).select("address").lean();
      if (userDoc && Array.isArray(userDoc.address)) {
        if (deliveryAddressId) {
          const matchAddr = userDoc.address.find(
            (a) => String(a._id) === String(deliveryAddressId)
          );
          if (matchAddr?.zipCode) {
            cleanDeliveryPin = String(matchAddr.zipCode).trim();
          }
        }
        if (!cleanDeliveryPin && userDoc.address[0]?.zipCode) {
          cleanDeliveryPin = String(userDoc.address[0].zipCode).trim();
        }
      }
    } catch (err) {
      logger.warn("Could not load user address for pincode lookup:", { error: err.message });
    }
  }

  // Resolve items & calculate subtotal
  const enrichedItems = [];
  let calculatedSubtotal = 0;

  if (isBuyNow && buyNowItem) {
    const productId = buyNowItem.productId || buyNowItem._id;
    const variantId = buyNowItem.variantId || null;
    const quantity = Math.max(1, Number(buyNowItem.quantity) || 1);

    if (productId) {
      const productDoc = await Product.findById(productId).lean();
      if (productDoc) {
        let salePrice = 0;
        let shippingDetails = null;

        if (variantId && productDoc.variant?.unitOnlyVariants) {
          const variant = productDoc.variant.unitOnlyVariants.find(
            (v) => String(v._id) === String(variantId)
          );
          if (variant) {
            salePrice = Number(variant.price?.salePrice || variant.price || 0);
            shippingDetails =
              variant.shipping && (Number(variant.shipping.productWeight) > 0 || Number(variant.shipping.dimension?.length) > 0)
                ? variant.shipping
                : (productDoc.shipping || {});
          }
        } else {
          salePrice = Number(productDoc.nonVariant?.price?.salePrice || productDoc.price?.salePrice || 0);
          shippingDetails = productDoc.shipping || {};
        }

        // If price still 0, check buyNowItem priceBreakdown
        if (salePrice <= 0 && buyNowItem.priceBreakdown?.salePrice) {
          salePrice = Number(buyNowItem.priceBreakdown.salePrice);
        }

        const itemSubtotal = salePrice * quantity;
        calculatedSubtotal += itemSubtotal;

        enrichedItems.push({
          productId: productDoc._id,
          variantId,
          productName: productDoc.productName,
          quantity,
          price: salePrice,
          subtotal: itemSubtotal,
          shipping: shippingDetails || { productWeight: 500, dimension: { length: 10, width: 10, height: 10 } },
        });
      }
    }
  } else if (Array.isArray(params.cartItems) && params.cartItems.length > 0) {
    for (const item of params.cartItems) {
      const productId = item.productId || item._id;
      const variantId = item.variantId || null;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      if (!productId) continue;

      const productDoc = await Product.findById(productId).lean();
      if (productDoc) {
        let salePrice = 0;
        let shippingDetails = null;

        if (variantId && productDoc.variant?.unitOnlyVariants) {
          const variant = productDoc.variant.unitOnlyVariants.find(
            (v) => String(v._id) === String(variantId)
          );
          if (variant) {
            salePrice = Number(variant.price?.salePrice || 0);
            shippingDetails =
              variant.shipping && (Number(variant.shipping.productWeight) > 0 || Number(variant.shipping.dimension?.length) > 0)
                ? variant.shipping
                : (productDoc.shipping || {});
          }
        } else {
          salePrice = Number(productDoc.nonVariant?.price?.salePrice || 0);
          shippingDetails = productDoc.shipping || {};
        }

        if (salePrice <= 0 && item.price) {
          salePrice = Number(item.price);
        }

        const itemSubtotal = salePrice * quantity;
        calculatedSubtotal += itemSubtotal;

        enrichedItems.push({
          productId: productDoc._id,
          variantId,
          productName: productDoc.productName,
          quantity,
          price: salePrice,
          subtotal: itemSubtotal,
          shipping: shippingDetails || { productWeight: 500, dimension: { length: 10, width: 10, height: 10 } },
        });
      }
    }
  } else if (userId) {
    const userCart = await cart.findOne({ userId }).lean();
    if (userCart && Array.isArray(userCart.items)) {
      for (const item of userCart.items) {
        const productDoc = await Product.findById(item.productId).lean();
        if (productDoc) {
          let salePrice = 0;
          let shippingDetails = null;

          if (item.variantId && productDoc.variant?.unitOnlyVariants) {
            const variant = productDoc.variant.unitOnlyVariants.find(
              (v) => String(v._id) === String(item.variantId)
            );
            if (variant) {
              salePrice = Number(variant.price?.salePrice || 0);
              shippingDetails =
                variant.shipping && (Number(variant.shipping.productWeight) > 0 || Number(variant.shipping.dimension?.length) > 0)
                  ? variant.shipping
                  : (productDoc.shipping || {});
            }
          } else {
            salePrice = Number(productDoc.nonVariant?.price?.salePrice || 0);
            shippingDetails = productDoc.shipping || {};
          }

          const quantity = Math.max(1, Number(item.quantity) || 1);
          const itemSubtotal = salePrice * quantity;
          calculatedSubtotal += itemSubtotal;

          enrichedItems.push({
            productId: productDoc._id,
            variantId: item.variantId,
            productName: productDoc.productName,
            quantity,
            price: salePrice,
            subtotal: itemSubtotal,
            shipping: shippingDetails || { productWeight: 500, dimension: { length: 10, width: 10, height: 10 } },
          });
        }
      }
    }
  }

  const subtotal = subtotalOverride !== null ? Number(subtotalOverride) : calculatedSubtotal;

  // Coupon application
  let couponDiscount = 0;
  let couponDetails = null;

  if (couponCode) {
    try {
      const now = new Date();
      const couponDoc = await CouponModel.findOne({
        code: couponCode,
        status: "active",
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      }).lean();

      if (couponDoc && subtotal >= (couponDoc.minPurchaseAmount || 0)) {
        if (couponDoc.discountType === "fixed") {
          couponDiscount = Number(couponDoc.discountValue || 0);
        } else if (couponDoc.discountType === "percentage") {
          couponDiscount = (subtotal * Number(couponDoc.discountValue || 0)) / 100;
          if (couponDoc.maxDiscountAmount && couponDoc.maxDiscountAmount > 0) {
            couponDiscount = Math.min(couponDiscount, Number(couponDoc.maxDiscountAmount));
          }
        }
        couponDiscount = Math.min(couponDiscount, subtotal);
        couponDetails = {
          code: couponDoc.code,
          discountType: couponDoc.discountType,
          discountValue: couponDoc.discountValue,
          maxDiscount: couponDoc.maxDiscountAmount,
          offerType: couponDoc.offerType,
        };
      }
    } catch (err) {
      logger.warn("Coupon check failed during pricing calculation:", { error: err.message });
    }
  }

  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);

  const DEFAULT_SHIPPING =
    process.env.DEFAULT_SHIPPING_CHARGE !== undefined
      ? Number(process.env.DEFAULT_SHIPPING_CHARGE)
      : 50;

  let shippingCharge = DEFAULT_SHIPPING;
  let quote = null;

  // Dynamic Shiprocket courier calculation for all orders based on delivery pincode
  const pincodeRegex = /^[1-9][0-9]{5}$/;

  if (cleanDeliveryPin && pincodeRegex.test(cleanDeliveryPin)) {
    const dimensions = calculateShipmentDimensions(enrichedItems);
    const rateResult = await getShippingRateEstimate({
      deliveryPincode: cleanDeliveryPin,
      weight: dimensions.weight,
      length: dimensions.length,
      breadth: dimensions.breadth,
      height: dimensions.height,
      cod: paymentMethod === "COD" ? 1 : 0,
      declaredValue: subtotalAfterCoupon,
    });

    if (rateResult.available && rateResult.rate >= 0) {
      shippingCharge = rateResult.rate;
      quote = {
        ...rateResult,
        provider: "Shiprocket",
      };
    } else {
      // Fallback scenario when Shiprocket rate API fails or courier is unserviceable
      shippingCharge = DEFAULT_SHIPPING;
      quote = {
        ...rateResult,
        fallbackApplied: true,
        rate: DEFAULT_SHIPPING,
        provider: "DefaultFallback",
        message: rateResult.message || "Courier rates unavailable, standard delivery rate applied",
      };
    }
  } else {
    // Pincode not yet provided or invalid - standard delivery fallback
    shippingCharge = DEFAULT_SHIPPING;
    quote = {
      available: false,
      fallbackApplied: true,
      rate: DEFAULT_SHIPPING,
      provider: "DefaultEstimate",
      deliveryPincode: cleanDeliveryPin,
      message: cleanDeliveryPin
        ? "Invalid pincode format (6 digits required), standard rate applied"
        : "Standard delivery estimate. Select delivery address for live courier rate.",
    };
  }

  const finalTotal = Number((subtotalAfterCoupon + shippingCharge).toFixed(2));

  return {
    success: true,
    subtotal: Number(subtotal.toFixed(2)),
    couponDiscount: Number(couponDiscount.toFixed(2)),
    couponDetails,
    subtotalAfterCoupon: Number(subtotalAfterCoupon.toFixed(2)),
    shipping: shippingCharge,
    shippingCharge: shippingCharge,
    finalTotal,
    quote,
    items: enrichedItems,
  };
};

/**
 * Controller/Service endpoint handler for fetching live shipping estimates
 * @param {object} req - Express request
 * @returns {Promise<object>}
 */
const getShippingEstimateHandler = async (req) => {
  const params = {
    userId: req.user?._id || req.body?.userId,
    deliveryPincode: req.body?.deliveryPincode || req.query?.pincode,
    deliveryAddressId: req.body?.deliveryAddressId,
    paymentMethod: req.body?.paymentMethod || "COD",
    couponCode: req.body?.couponCode || null,
    isBuyNow: Boolean(req.body?.isBuyNow),
    buyNowItem: req.body?.buyNowItem || null,
    cartItems: req.body?.cartItems || req.body?.items || null,
    subtotalOverride: req.body?.subtotal ? Number(req.body.subtotal) : null,
  };

  const result = await calculateOrderShippingAndPricing(params);
  return {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
  };
};

module.exports = {
  validateWebhookToken,
  getIncomingToken,
  extractPayload,
  mapShiprocketStatus,
  canTransitionStatus,
  handleShiprocketWebhook,
  syncOrderTracking,
  validateWebhookEndpoint,
  calculateOrderShippingAndPricing,
  getShippingEstimateHandler,
};
