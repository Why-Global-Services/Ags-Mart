const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");

// Models
const { cart } = require("../../../models/cart.model");
const { orderDetailsModel } = require("../../../models/orders.model");
const { paymentDetailsModel } = require("../../../models/payment.model");
const { Product } = require("../../../models/Product.model");
const { User } = require("../../../models/users.model");
const { CouponModel } = require("../../../models/coupons.model");

// Services & Utils
const { generateOrderId } = require("../../../utils/generateId");
const { createStripeCheckoutSession } = require("../Payment/payment.service");
const ApiError = require("../../../utils/apiError");
const logger = require("../../../config/logger");
const { performance } = require("perf_hooks");
const { sendOrderCreatedWhatsApp } = require("../../../utils/aiSensy");

class OrderService {
  constructor() {
    this.checkEnvironmentVariables();
    this.razorpayInstance = this.initializeRazorpay();
    this.circuitBreakers = new Map();
    this.couponAttempts = new Map();
  }

  checkEnvironmentVariables() {
    const requiredEnvVars = ["RAZORPAY_KEY", "RAZORPAY_SECRET"];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      console.warn("⚠️ Missing environment variables:", missingVars);
    } else {
      console.log("✅ All required environment variables are present");
    }
  }

  initializeRazorpay() {
    // Try both environment variable naming conventions
    const key_id = process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY_ID;
    const key_secret =
      process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRET_KEY;

    if (!key_id || !key_secret) {
      logger.warn(
        "Razorpay credentials not found. Razorpay payments will be disabled."
      );
      return null;
    }

    try {
      return new Razorpay({
        key_id: key_id,
        key_secret: key_secret,
      });
    } catch (error) {
      logger.error("Failed to initialize Razorpay", { error: error.message });
      return null;
    }
  }

  /**
   * Main order placement with optimized flow
   */
  async placeOrder(req) {
    const startTime = performance.now();
    const session = await mongoose.startSession();

    console.log("🚀 Starting order placement process", {
      userId: req.user?._id,
      bodyKeys: Object.keys(req.body),
    });

    try {
      await session.startTransaction();
      logger.info("Order placement started", { userId: req.user?._id });

      const { couponCode, paymentMethod, isBuyNow = false } = req.body;
      const userId = this.validateUser(req.user);

      const preparationResult = await this.prepareOrderData({
        userId,
        orderData: req.body,
        isBuyNow,
        session,
      });

      // Phase 2: Pricing Calculation
      const pricing = await this.calculatePricing({
        cartItems: preparationResult.cartItems,
        totalAmount: preparationResult.totalAmount,
        couponCode,
        userId,
      });

      const finalCartItems = pricing.cartItems || preparationResult.cartItems;

      // Phase 3: Order Creation
      const order = await this.createOrderTransaction(
        {
          userId,
          cartItems: finalCartItems,
          userData: preparationResult.userData,
          pricing,
          paymentMethod,
          isBuyNow,
        },
        session
      );

      // Phase 4: Payment Processing
      const paymentResult = await this.processPaymentWithRetry({
        paymentMethod,
        amount: pricing.finalTotal,
        order,
        userId,
      });

      await session.commitTransaction();

      const duration = performance.now() - startTime;
      this.logOrderSuccess(order, userId, duration);

      /* ================================
   SEND WHATSAPP (AISENSY)
================================ */
try {
  await sendOrderCreatedWhatsApp({
    name: order.userName,
    email: order.email,
    phone: order.contactNumber,
    orderId: order.orderId,
    amount: order.totalPrice,
    paymentType: order.paymentMethod,

    // Shiprocket not yet → keep default
    awbNumber: "-",
    courierName: "-",
    shippingStatus: "Order Confirmed",
  });
} catch (err) {
  console.error("❌ WhatsApp send failed:", err.message);
}

/* ================================ */

      return this.formatOrderResponse(order, paymentResult, pricing);
    } catch (error) {
      await this.handleOrderFailure(error, session, req.user?._id);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   Parallel data preparation
   */
  async prepareOrderData({ userId, orderData, isBuyNow, session }) {
    const [userData, itemsResult] = await Promise.all([
      this.getUserWithAddresses(userId, orderData, isBuyNow),
      this.getOrderItems(orderData, userId, isBuyNow, session),
    ]);

    return {
      userData,
      cartItems: itemsResult.cartItems,
      totalAmount: itemsResult.totalAmount,
      productsId: itemsResult.productsId,
    };
  }

/**
 * UPDATED: Enhanced pricing calculation with automatic discounts
 */
async calculatePricing({ cartItems, totalAmount, couponCode, userId, paymentMethod }) {
  console.log("💰 Starting simplified pricing calculation:", {
    cartItemsCount: cartItems.length,
    totalAmount,
    couponCode,
    paymentMethod,
  });

    let updatedCartItems = [...cartItems];

  // Step 1: Calculate subtotal from sale prices only
  const subtotal = updatedCartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  console.log("📊 Subtotal (from sale prices):", subtotal);

  // Step 2: Apply coupon discount
  const couponResult = await this.applyCouponWithValidation(
    couponCode,
    subtotal,
    userId
  );



/* ===============================
   ADD FREE PRODUCT IF EXISTS
================================ */
if (
  couponResult?.couponDetails?.offerType === "FREE_PRODUCT" &&
  couponResult?.couponDetails?.freeProduct
) {
  const freeProd = couponResult.couponDetails.freeProduct;

  console.log("🎁 Adding free product:", freeProd);

  const product = await Product.findById(freeProd.productId);

  if (!product) {
    throw new ApiError(404, "Free product not found");
  }

  const variant = this.findProductVariant(
    product,
    freeProd.variantId,
    freeProd.productType
  );

  if (!variant && freeProd.productType !== "nonVariant") {
    throw new ApiError(404, "Free product variant not found");
  }

  const freeItem = {
    productId: product._id,
    variantId: freeProd.variantId || null,
    productType: freeProd.productType,
    quantity: 1,

    // ✅ FREE
    price: 0,
    subtotal: 0,

    productName: product.productName,
    productImage: product.productImages?.[0],

    isFreeProduct: true, // ⭐ Important flag
  };

  updatedCartItems.push(freeItem);
}


  console.log("🎟️ Coupon result:", {
    discount: couponResult.discount,
    couponCode: couponResult.couponDetails?.code,
  });

  // Step 3: Calculate subtotal after coupon
  const subtotalAfterCoupon = Math.max(0, subtotal - couponResult.discount);

  console.log("📊 Subtotal after coupon:", subtotalAfterCoupon);

  // Step 4: Add shipping charge (configurable)
  const shippingCharge = this.calculateShippingCharge(cartItems, subtotalAfterCoupon);

  console.log("📦 Shipping charge:", shippingCharge);

  // Step 5: Calculate final total
  const finalTotal = subtotalAfterCoupon + shippingCharge;

  const pricing = {
    subtotal: subtotal, // Original sale price total
    couponDiscount: couponResult.discount,
    couponDetails: couponResult.couponDetails,
    subtotalAfterCoupon: subtotalAfterCoupon, // After coupon discount
    shipping: shippingCharge,
    finalTotal: Number(finalTotal.toFixed(2)),
  };

  console.log("💰 Final pricing calculation:", {
    subtotal: pricing.subtotal,
    couponDiscount: pricing.couponDiscount,
    subtotalAfterCoupon: pricing.subtotalAfterCoupon,
    shipping: pricing.shipping,
    finalTotal: pricing.finalTotal,
  });

  // Validation check
  if (pricing.finalTotal < 0) {
    console.error("❌ NEGATIVE TOTAL DETECTED!", pricing);
    throw new ApiError(500, "Pricing calculation error: negative total");
  }

  return {
  ...pricing,
  cartItems: updatedCartItems, // ✅ pass updated cart
};
}

  /**
   * Calculate total tax from cart items
   */
  calculateTax(cartItems) {
  const totalTax = cartItems.reduce((sum, item) => {
    const itemTax = item.tax || 0; // Tax percentage
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 1;
    
    // Calculate tax on base price
    const itemTaxAmount = (itemPrice * itemQuantity * itemTax) / 100;
    
    console.log("🧮 Tax calculation for item:", {
      productName: item.productName,
      price: itemPrice,
      quantity: itemQuantity,
      taxPercent: itemTax,
      taxAmount: itemTaxAmount,
    });
    
    return sum + itemTaxAmount;
  }, 0);

  console.log("💵 Total tax calculated:", totalTax);
  return Number(totalTax.toFixed(2));
}

/**
 * Calculate automatic discounts (First Order + Prepaid)
 * Called BEFORE coupon application
 */
async calculateAutomaticDiscounts({ userId, paymentMethod, subtotalBeforeTax }) {
  const discounts = {
    firstOrderDiscount: 0,
    prepaidDiscount: 0,
    totalAutomaticDiscount: 0,
    isFirstOrder: false,
    isPrepaid: false,
  };

  // Check if this is user's first order
  const existingOrders = await orderDetailsModel.countDocuments({
    userId,
    orderStatus: { $nin: ["Cancelled", "Pending"] }, // Don't count cancelled/pending
  });

  const isFirstOrder = existingOrders === 0;
  discounts.isFirstOrder = isFirstOrder;

  // Check if payment is prepaid (not COD)
  const isPrepaid = paymentMethod && paymentMethod !== "COD";
  discounts.isPrepaid = isPrepaid;

  const DISCOUNT_PERCENTAGE = 5; // 5% discount

  // Apply first order discount (5%)
  if (isFirstOrder) {
    discounts.firstOrderDiscount = (subtotalBeforeTax * DISCOUNT_PERCENTAGE) / 100;
    console.log("🎉 First order discount applied:", {
      percentage: DISCOUNT_PERCENTAGE,
      amount: discounts.firstOrderDiscount,
    });
  }

  // Apply prepaid discount (5%) - only if NOT first order
  // Note: User gets EITHER first order OR prepaid discount, not both
  if (isPrepaid && !isFirstOrder) {
    discounts.prepaidDiscount = (subtotalBeforeTax * DISCOUNT_PERCENTAGE) / 100;
    console.log("💳 Prepaid discount applied:", {
      percentage: DISCOUNT_PERCENTAGE,
      amount: discounts.prepaidDiscount,
    });
  }

  // Total automatic discount
  discounts.totalAutomaticDiscount =
    discounts.firstOrderDiscount + discounts.prepaidDiscount;

  console.log("✅ Automatic discounts calculated:", {
    isFirstOrder,
    isPrepaid,
    firstOrderDiscount: discounts.firstOrderDiscount.toFixed(2),
    prepaidDiscount: discounts.prepaidDiscount.toFixed(2),
    total: discounts.totalAutomaticDiscount.toFixed(2),
  });

  return discounts;
}

  /**
   * Enhanced coupon validation with simple rate limiting
   */
async applyCouponWithValidation(couponCode, totalAmount, userId) {
  if (!couponCode) {
    return { discount: 0, couponDetails: null };
  }

  // Simple in-memory rate limiting
  const rateLimitKey = `${userId}:${couponCode}`;
  const currentAttempts = this.couponAttempts.get(rateLimitKey) || 0;

  if (currentAttempts > 5) {
    throw new ApiError(
      429,
      "Too many coupon attempts. Please try again later."
    );
  }

  try {
    const coupon = await CouponModel.findOne({
      code: couponCode,
      status: "active",
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      this.couponAttempts.set(rateLimitKey, currentAttempts + 1);
      throw new ApiError(400, "Invalid or expired coupon");
    }

    // Check repeat usage
    if (coupon.repeatUsage === "notAllowed") {
      const existingOrder = await orderDetailsModel.findOne({
        userId: userId,
        "orderDetails.couponCode": coupon.code,
      });

      if (existingOrder) {
        throw new ApiError(400, "You have already used this coupon");
      }
    }

    // Check global usage limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, "Coupon usage limit exceeded");
    }

    // Check minimum purchase
    if (totalAmount < coupon.minPurchaseAmount) {
      throw new ApiError(
        400,
        `Minimum purchase of ₹${coupon.minPurchaseAmount} required`
      );
    }

    // Calculate discount
    let discount = this.calculateDiscountAmount(coupon, totalAmount);

    // Ensure discount never exceeds total
    discount = Math.min(discount, totalAmount);

    console.log("🎟️ Coupon validation successful:", {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      calculatedDiscount: discount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      totalAmount: totalAmount,
    });

    // Update coupon usage
    await CouponModel.updateOne(
      { _id: coupon._id },
      { $inc: { usedCount: 1 } }
    );

    // Reset attempts on successful coupon application
    this.couponAttempts.delete(rateLimitKey);

    return {
      discount,
      couponDetails: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscountAmount,
        offerType: coupon.offerType,
        freeProduct: coupon.offerType === "FREE_PRODUCT"
      ? coupon.freeProduct
      : null,
      },
    };
  } catch (error) {
    this.couponAttempts.set(rateLimitKey, currentAttempts + 1);
    throw error;
  }
}

  /**
   * Separate discount calculation for testability
   */
calculateDiscountAmount(coupon, totalAmount) {
  let discount = 0;

  if (coupon.discountType === "fixed") {
    // Fixed discount: use the discount value directly
    discount = coupon.discountValue;
  } else if (coupon.discountType === "percentage") {
    // Percentage discount
    discount = (totalAmount * coupon.discountValue) / 100;
    
    // Apply max discount cap if specified
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  }

  // Never allow discount to exceed total amount
  discount = Math.min(discount, totalAmount);

  console.log("🧮 Discount calculation:", {
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    totalAmount: totalAmount,
    calculatedDiscount: discount,
  });

  return Number(discount.toFixed(2));
}

  /**
   * Optimized order creation with validation
   */
  async createOrderTransaction(orderData, session) {
    const { userId, cartItems, userData, pricing, paymentMethod, isBuyNow } =
      orderData;

    // Validate stock availability before creating order
    await this.validateStockAvailability(cartItems, session);

    const orderId = await generateOrderId();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const orderPayload = this.buildOrderPayload({
      orderId,
      userId,
      userData,
      cartItems,
      pricing,
      paymentMethod,
      isBuyNow,
      expiresAt,
    });

    console.log("📦 Creating order:", {
      orderId,
      userId,
      itemCount: cartItems.length,
      totalAmount: pricing.finalTotal,
    });

    try {
      console.log("🔄 Attempting to create order in database...");
      const order = await orderDetailsModel.create([orderPayload], { session });
      console.log("✅ Order created successfully:", order[0].orderId);
      return order[0];
    } catch (error) {
      console.error("❌ Order creation failed with error:", {
        name: error.name,
        message: error.message,
        code: error.code,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue,
      });

      if (error.code === 11000) {
        // Duplicate order ID, retry with new ID
        console.log("🔄 Duplicate order ID detected, retrying with new ID...");
        return await this.createOrderTransaction(orderData, session);
      }

      // Log validation errors in detail
      if (error.name === "ValidationError") {
        console.error("📋 Validation errors:", error.errors);
      }

      throw new ApiError(500, "Failed to create order", error.message);
    }
  }

  normalizeAddress(address) {
  if (!address) return null;

  return {
    _id: address._id,
    fullName: address.fullName || "",
    addressLine1: address.addressLine1 || "",
    landMark: address.landMark || "",   // ✅ FIX
    city: address.city || "",
    state: address.state || "",
    zipCode: address.zipCode || "",     // ✅ FIX
    country: address.country || "India",
    phone: address.phone || "",
    addressType: address.addressType || "",
    checkoutAddress: address.checkoutAddress || "",
  };
}


/**
 * UPDATED: Build order payload to include automatic discounts
 */
buildOrderPayload({
  orderId,
  userId,
  userData,
  cartItems,
  pricing,
  paymentMethod,
  isBuyNow,
  expiresAt,
}) {
  console.log("userData", userData);
  const userName = userData.fullName || userData.userName || "Customer";
  const contactNumber = userData.phone || userData.contactNumber || "Not Provided";
  const email = userData.email || "no-email@example.com";

const validatedCartItems = cartItems.map((item) => {
  // ✅ Use the normalizeProductType helper
  const productType = this.normalizeProductType(item.productType);

  const subtotal = item.subtotal || item.price * item.quantity || 0;

  return {
    ...item,
    productType,
    subtotal,
  };
});

  const orderPayload = {
    orderId,
    userId,
    email: email,
    userName: userName,
    orderStatus: "Pending",
    contactNumber: contactNumber,
    billingAddress: userData.billingAddress,
    deliveryAddress: userData.deliveryAddress,
    isBuyNow: isBuyNow || false,
    expiresAt,
    orderDetails: [
      {
        products: validatedCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productType: item.productType,
          quantity: item.quantity,
          price: item.price,
          isFreeProduct: item.isFreeProduct || false,
          customizationCost: item.customizationCost || 0,
          customization: item.customization || null,
          subtotal: item.subtotal,
          orderStatus: "Pending",
          paymentStatus: "Pending",
        })),
        
        // Simplified pricing details
        couponCode: pricing.couponDetails?.code || null,
        couponDetails: pricing.couponDetails || null,
        cartQuantity: validatedCartItems.length,
        price: pricing.subtotalAfterCoupon, // After coupon discount
        discount: pricing.couponDiscount || 0, // Only coupon discount
        tax: 0, // No tax calculation
        shippingCharge: pricing.shipping,
        finalAmount: pricing.finalTotal,
      },
    ],
    paymentMethod,
    paymentStatus: "Pending",
    totalPrice: pricing.finalTotal,
    metadata: {
      version: "1.0",
      createdAt: new Date(),
      source: isBuyNow ? "buy_now" : "cart",
      discountsApplied: {
        coupon: pricing.couponDiscount || 0,
      },
    },
  };

  console.log("✅ Order payload validation passed");
  return orderPayload;
}

  /**
   * Enhanced payment processing with retry mechanism
   */
  async processPaymentWithRetry({ paymentMethod, amount, order, userId }) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`💳 Processing payment attempt ${attempt}:`, {
          paymentMethod,
          amount,
          orderId: order.orderId,
        });

        const result = await this.processPayment({
          paymentMethod,
          amount,
          order,
          userId,
        });

        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Payment attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          const backoffTime = 1000 * attempt;
          console.log(`⏳ Waiting ${backoffTime}ms before retry...`);
          await this.sleep(backoffTime);
        }
      }
    }

    throw new ApiError(
      500,
      "Payment processing failed after multiple attempts",
      lastError?.message
    );
  }

  /**
   * Original payment processing (kept for compatibility)
   */
  async processPayment({ paymentMethod, amount, order, userId }) {
    const paymentData = {
      userId,
      orderId: order._id,
      amount,
      subtotal: order.orderDetails[0].price,
      discount: order.orderDetails[0].discount,
      paymentMethod,
      paymentStatus: "initiated",
    };

    switch (paymentMethod) {
      case "RazorPay":
        if (!this.razorpayInstance) {
          throw new ApiError(400, "Razorpay is not configured");
        }

        order.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await order.save();

        const razorpayOrder = await this.razorpayInstance.orders.create({
          amount: Math.round(amount * 100),
          currency: "INR",
          receipt: `REC_${order.orderId}`,
        });

        paymentData.razorpayOrderId = razorpayOrder.id;
        paymentData.pendingPaymentExpiry = new Date(
          Date.now() + 30 * 60 * 1000
        );
        await paymentDetailsModel.create(paymentData);

        return { razorpayOrder };

      case "Stripe":
        const stripeUrl = await createStripeCheckoutSession(
          amount,
          userId,
          order.orderId,
          order._id
        );
        paymentData.stripePayOrderId = order.orderId;
        await paymentDetailsModel.create(paymentData);

        return { stripeUrl };

      case "COD":
        order.orderStatus = "Ordered";
        order.paymentStatus = "Pending";
        order.expiresAt = null;
        await order.save();

        paymentData.paymentStatus = "pending";
        paymentData.pendingPaymentExpiry = null;
        await paymentDetailsModel.create(paymentData);

        // Clear cart for COD
        await cart.findOneAndDelete({ userId });

        return {};

      default:
        throw new ApiError(400, "Unsupported payment method");
    }
  }

  /**
   * Enhanced stock validation
   */
  async validateStockAvailability(cartItems, session) {
    console.log(
      "🔍 Validating stock availability for",
      cartItems.length,
      "items"
    );

    const stockPromises = cartItems.map(async (item) => {
      console.log("📦 Validating item:", {
        productId: item.productId,
        variantId: item.variantId,
        productType: item.productType,
        quantity: item.quantity,
      });

      // Use Product model
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }

      const variant = this.findProductVariant(
        product,
        item.variantId,
        item.productType
      );
      if (!variant) {
        throw new ApiError(
          404,
          `Variant ${item.variantId} not found for product ${product.productName}`
        );
      }

      const availableStock =
        item.productType === "nonVariation" || item.productType === "nonVariant"
          ? product.nonVariant?.stockCount
          : variant.stockCount;

      if (!availableStock || availableStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${product.productName}. Available: ${availableStock}, Requested: ${item.quantity}`
        );
      }

      console.log(
        `✅ Stock validated for ${product.productName}: ${availableStock} available`
      );
    });

    await Promise.all(stockPromises);
    console.log("✅ All stock validated successfully");
  }

  /**
   * Enhanced error handling
   */
  async handleOrderFailure(error, session, userId) {
    console.error("💥 Order placement failed:", error.message);

    try {
      await session.abortTransaction();
      console.log("✅ Transaction aborted successfully");
    } catch (abortError) {
      console.error("❌ Failed to abort transaction:", abortError.message);
    }

    logger.error("Order placement failed", {
      userId,
      error: error.message,
      stack: error.stack,
    });

    // Notify monitoring system
    await this.notifyOrderFailure(error, userId);
  }

  /**
   * Success logging and metrics
   */
  logOrderSuccess(order, userId, duration) {
    console.log("🎉 Order placement completed successfully", {
      orderId: order.orderId,
      userId,
      duration: `${duration.toFixed(2)}ms`,
    });

    logger.info("Order placed successfully", {
      orderId: order.orderId,
      userId,
      duration: `${duration.toFixed(2)}ms`,
      itemCount: order.orderDetails[0]?.products?.length || 0,
      totalAmount: order.totalPrice,
    });
  }

  /**
   * Standardized response format
   */
  formatOrderResponse(order, paymentResult, pricing) {
    return {
      success: true,
      message: "Order Created Successfully",
      data: {
        orderId: order.orderId,
        userOrder: order,
        ...paymentResult,
        pricingSummary: pricing,
        nextSteps: this.getNextSteps(order.paymentMethod),
      },
    };
  }

  /**
   * Optimized order items retrieval
   */
  async getOrderItems(orderData, userId, isBuyNow, session) {
    if (isBuyNow) {
      return await this.getBuyNowItems(orderData, session);
    } else {
      return await this.getCartItems(userId, session);
    }
  }

  /**
   * Optimized buy now items with stock validation
   */
  async getBuyNowItems(orderData, session) {
    const {
      productId,
      variantId,
      quantity = 1,
      productType = "nonVariation",
    } = orderData;

    console.log("🛍️ Processing buy now items:", {
      productId,
      variantId,
      quantity,
      productType,
    });

    const product = await Product.findById(productId).session(session);
    if (!product) throw new ApiError(404, "Product not found");

    // Map product type if needed
    const mappedProductType =
      productType === "variant"
        ? "variation"
        : productType === "nonVariant"
        ? "nonVariation"
        : productType;

    const variant = this.findProductVariant(
      product,
      variantId,
      mappedProductType
    );
    if (!variant) throw new ApiError(404, "Product variant not found");

    await this.validateStock(
      product,
      variant,
      quantity,
      mappedProductType,
      session
    );

    const basePrice = this.getVariantPrice(variant);
    const tax = variant.price?.tax || 0;
    const subtotal = basePrice * quantity;

    console.log("✅ Buy now items processed successfully");

    return {
      cartItems: [
        {
          productId: product._id,
          variantId: variant._id,
          productType: mappedProductType,
          quantity,
          price: basePrice,
          tax: tax,
          subtotal,
          productName: product.productName || product.name,
          productImage: product.productImages?.[0] || product.productImage,
          selectedVariant: variant,
          productCategory: product.productCategory,
        },
      ],
      totalAmount: subtotal,
      productsId: [productId],
    };
  }

  /**
   * Optimized cart items with aggregation pipeline
   */
  async getCartItems(userId, session) {
    console.log("🛒 START: getCartItems()", { userId, hasSession: !!session });

    try {
      console.log("🔍 STEP 1: Finding user cart...");
      const userCart = await cart.findOne({ userId }).session(session);
      console.log("✅ Cart query completed:", {
        cartExists: !!userCart,
        itemCount: userCart?.items?.length || 0,
        cartId: userCart?._id,
      });

      if (!userCart?.items?.length) {
        console.error("❌ Cart is empty or has no items");
        throw new ApiError(400, "Cart is empty");
      }

      console.log("🎯 STEP 2: Starting aggregation pipeline...");
      console.log("📊 Cart items to process:", userCart.items.length);

      // Single aggregation to get all product data
      const cartWithProducts = await cart
        .aggregate([
          {
            $match: { userId: userId },
          },
          {
            $unwind: "$items",
          },
          {
            $lookup: {
              from: "product",
              let: {
                productId: "$items.productId",
                variantId: "$items.variantId",
              },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$productId"] },
                  },
                },
                {
                  $unwind: {
                    path: "$variant",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $unwind: {
                    path: "$nonVariant",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $addFields: {
                    matchedVariant: {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $eq: ["$variant.variantType", "sizeColor"],
                            },
                            then: {
                              $filter: {
                                input: "$variant.sizeColorVariants",
                                as: "v",
                                cond: { $eq: ["$$v._id", "$$variantId"] },
                              },
                            },
                          },
                          {
                            case: {
                              $eq: ["$variant.variantType", "colorOnly"],
                            },
                            then: {
                              $filter: {
                                input: "$variant.colorOnlyVariants",
                                as: "v",
                                cond: { $eq: ["$$v._id", "$$variantId"] },
                              },
                            },
                          },
                          {
                            case: { $eq: ["$variant.variantType", "sizeOnly"] },
                            then: {
                              $filter: {
                                input: "$variant.sizeOnlyVariants",
                                as: "v",
                                cond: { $eq: ["$$v._id", "$$variantId"] },
                              },
                            },
                          },
                        ],
                        default: [],
                      },
                    },
                  },
                },
                {
                  $addFields: {
                    matchedVariant: { $arrayElemAt: ["$matchedVariant", 0] },
                  },
                },
                {
                  $addFields: {
                    finalPrice: {
                      $cond: {
                        if: { $gt: [{ $type: "$matchedVariant" }, "missing"] },
                        then: "$matchedVariant.price.salePrice",
                        else: "$nonVariant.price.salePrice",
                      },
                    },
                    stockCount: {
                      $cond: {
                        if: { $gt: [{ $type: "$matchedVariant" }, "missing"] },
                        then: "$matchedVariant.stockCount",
                        else: "$nonVariant.stockCount",
                      },
                    },
                    discount: {
                      $cond: {
                        if: { $gt: [{ $type: "$matchedVariant" }, "missing"] },
                        then: "$matchedVariant.price.discount",
                        else: "$nonVariant.price.discount",
                      },
                    },
                    tax: {
                      $cond: {
                        if: { $gt: [{ $type: "$matchedVariant" }, "missing"] },
                        then: "$matchedVariant.price.tax",
                        else: "$nonVariant.price.tax",
                      },
                    },
                  },
                },
                {
                  $project: {
                    productName: 1,
                    productCategory: 1,
                    productImages: 1,
                    productType: 1,
                    variant: 1,
                    nonVariant: 1,
                    matchedVariant: 1,
                    finalPrice: 1,
                    discount: 1,
                    stockCount: 1,
                    tax: 1,
                  },
                },
              ],
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $group: {
              _id: "$_id",
              items: {
                $push: {
                  $mergeObjects: [
                    "$items",
                    {
                      productDetails: "$productDetails",
                      productName: "$productDetails.productName",
                      productImage: "$productDetails.productImages",
                      productCategory: "$productDetails.productCategory",
                      price: "$productDetails.finalPrice",
                      discount: "$productDetails.discount",
                      stockCount: "$productDetails.stockCount",
                      tax: "$productDetails.tax",
                    },
                  ],
                },
              },
            },
          },
        ])
        .session(session);

      console.log("✅ Aggregation pipeline completed");
      console.log("📦 Aggregation result:", {
        resultCount: cartWithProducts.length,
        hasData: cartWithProducts.length > 0,
      });

      if (!cartWithProducts.length) {
        console.error("❌ No cart products found in aggregation result");
        throw new ApiError(404, "Cart products not found");
      }

      console.log("🎯 STEP 3: Processing aggregated cart items...");
      const cartItems = cartWithProducts[0].items.map((item) => {
        // Fix product type mapping
        const productType =
          item.productType === "variant"
            ? "variation"
            : item.productType === "nonVariant"
            ? "nonVariation"
            : item.productType;

        // Calculate subtotal
        const price = parseFloat(item.price) || 0;
        const tax = parseFloat(item.tax) || 0;
        const subtotal = price * item.quantity;

        return {
          ...item,
          productType,
          price,
          tax,
          subtotal,
          productImage: item.productImages?.[0] || item.productImage,
        };
      });

      console.log("📋 Processed cart items:", {
        itemCount: cartItems.length,
        sampleItem:
          cartItems.length > 0
            ? {
                productId: cartItems[0].productId,
                productName: cartItems[0].productName,
                productType: cartItems[0].productType,
                price: cartItems[0].price,
                tax: cartItems[0].tax,
                quantity: cartItems[0].quantity,
                subtotal: cartItems[0].subtotal,
              }
            : "No items",
      });

      console.log("💰 STEP 4: Calculating total amount...");
      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + item.subtotal;
      }, 0);

      console.log("✅ Total amount calculated:", totalAmount);

      console.log("🎯 STEP 5: Extracting product IDs...");
      const productsId = cartItems.map((item) => item.productId);
      console.log("📋 Product IDs extracted:", {
        count: productsId.length,
        uniqueProducts: [...new Set(productsId)].length,
      });

      console.log("🎉 SUCCESS: getCartItems() completed successfully");
      console.log("📊 FINAL RESULT:", {
        cartItemsCount: cartItems.length,
        totalAmount: totalAmount,
        productsIdCount: productsId.length,
      });

      return { cartItems, totalAmount, productsId };
    } catch (error) {
      console.error("💥 ERROR in getCartItems():", {
        error: error.message,
        stack: error.stack,
        userId: userId,
      });
      throw error;
    }
  }

  /**
   * Enhanced variant finding for new product structure
   */
  findProductVariant(product, variantId, productType) {
    console.log("🔍 Finding product variant:", {
      productId: product._id,
      variantId,
      productType,
      hasVariant: !!product.variant,
      hasNonVariant: !!product.nonVariant,
    });

    if (productType === "nonVariation" || productType === "nonVariant") {
      // For non-variant products
      if (
        product.nonVariant &&
        product.nonVariant._id.toString() === variantId?.toString()
      ) {
        console.log("✅ Found non-variant product");
        return product.nonVariant;
      }
    } else {
      // For variant products - search through all variant types
      if (product.variant) {
        let foundVariant = null;

        // Search in size-color variants
        if (product.variant.sizeColorVariants) {
          foundVariant = product.variant.sizeColorVariants.find(
            (v) => v._id.toString() === variantId?.toString()
          );
        }

        // Search in color-only variants
        if (!foundVariant && product.variant.colorOnlyVariants) {
          foundVariant = product.variant.colorOnlyVariants.find(
            (v) => v._id.toString() === variantId?.toString()
          );
        }

        // Search in size-only variants
        if (!foundVariant && product.variant.sizeOnlyVariants) {
          foundVariant = product.variant.sizeOnlyVariants.find(
            (v) => v._id.toString() === variantId?.toString()
          );
        }

        if (foundVariant) {
          console.log("✅ Found variant product:", foundVariant._id);
          return foundVariant;
        }
      }
    }

    console.error("❌ Variant not found:", {
      variantId,
      productType,
      availableNonVariantId: product.nonVariant?._id,
      availableSizeColorVariants:
        product.variant?.sizeColorVariants?.map((v) => v._id) || [],
      availableColorOnlyVariants:
        product.variant?.colorOnlyVariants?.map((v) => v._id) || [],
      availableSizeOnlyVariants:
        product.variant?.sizeOnlyVariants?.map((v) => v._id) || [],
    });

    return null;
  }

  /**
   * Get variant price
   */
  getVariantPrice(variant) {
    if (!variant) return 0;

    // Handle both old and new price structures
    const price = variant.price || variant;
    return parseFloat(
      price?.salePrice || price?.regularPrice || price?.realPrice || 0
    );
  }

  /**
 * Calculate shipping charge based on category & price
 */
/**
 * Calculate shipping charge based on category & price
 */
calculateShippingCharge(cartItems, subtotalAfterCoupon) {
  // Configuration - change these values as needed
  const SHIPPING_CHARGE = 50; // Default shipping charge
  const FREE_SHIPPING_THRESHOLD = 999; // Free shipping above this amount
  
  console.log("📦 Calculating shipping:", {
    subtotalAfterCoupon,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    defaultShipping: SHIPPING_CHARGE,
  });

  // Apply free shipping if subtotal is above threshold
  if (subtotalAfterCoupon >= FREE_SHIPPING_THRESHOLD) {
    console.log("✅ Free shipping applied (above threshold)");
    return 0;
  }

  console.log(`📦 Applying ₹${SHIPPING_CHARGE} shipping charge`);
  return SHIPPING_CHARGE;
}
  /**
   * Validate stock for a single product
   */
  async validateStock(product, variant, quantity, productType, session) {
    let stock = 0;

    if (productType === "nonVariation" || productType === "nonVariant") {
      stock = product.nonVariant?.stockCount || 0;
    } else {
      stock = variant?.stockCount || 0;
    }

    console.log("📦 Stock validation:", {
      productName: product.productName,
      productType,
      variantId: variant?._id,
      availableStock: stock,
      requestedQuantity: quantity,
    });

    if (!stock || stock < quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.productName}. Available: ${stock}, Requested: ${quantity}`
      );
    }
  }

  /**
   * Enhanced Razorpay verification with transaction safety
   */
  async verifyRazorpay(req) {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();
      logger.info("Razorpay verification started", { userId: req.user._id });

      const { orderId } = req.params;
      const { response } = req.body;
      const userId = req.user._id;

      console.log("🔍 Starting Razorpay verification", { orderId, userId });

      // Input validation
      if (
        !response?.razorpay_order_id ||
        !response?.razorpay_payment_id ||
        !response?.razorpay_signature
      ) {
        throw new ApiError(400, "Missing required payment fields");
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        response;

      // Check if Razorpay is configured
      if (!this.razorpayInstance) {
        throw new ApiError(400, "Razorpay is not configured");
      }

      // Get Razorpay secret key - try different environment variable names
      const razorpaySecret =
        process.env.RAZORPAY_SECRET_KEY || process.env.RAZORPAY_SECRET;

      if (!razorpaySecret) {
        console.error(
          "❌ Razorpay secret key not found in environment variables"
        );
        throw new ApiError(500, "Razorpay configuration error");
      }

      console.log(
        "✅ Razorpay secret key found, length:",
        razorpaySecret.length
      );

      // Find payment record first
      const paymentRecord = await paymentDetailsModel
        .findOne({ razorpayOrderId: razorpay_order_id })
        .session(session);

      if (!paymentRecord) {
        throw new ApiError(404, "Payment record not found");
      }

      // Check if already processed
      if (paymentRecord.paymentStatus === "paid") {
        throw new ApiError(400, "Payment has already been processed");
      }

      // Check expiry
      const now = new Date();
      if (
        paymentRecord.pendingPaymentExpiry &&
        paymentRecord.pendingPaymentExpiry < now
      ) {
        await paymentDetailsModel.findByIdAndUpdate(
          paymentRecord._id,
          { paymentStatus: "failed" },
          { session }
        );
        throw new ApiError(400, "Payment session has expired");
      }

      // Signature verification
      console.log("🔐 Verifying payment signature...");
      const generatedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      console.log("📋 Signature comparison:", {
        generated: generatedSignature.substring(0, 10) + "...",
        received: razorpay_signature.substring(0, 10) + "...",
      });

      if (generatedSignature !== razorpay_signature) {
        await paymentDetailsModel.findByIdAndUpdate(
          paymentRecord._id,
          { paymentStatus: "failed" },
          { session }
        );
        throw new ApiError(400, "Invalid payment signature");
      }

      console.log("✅ Signature verified successfully");

      // Verify with Razorpay API
      console.log("🔍 Verifying with Razorpay API...");
      const { items = [] } = await this.razorpayInstance.orders.fetchPayments(
        razorpay_order_id
      );
      const paymentItem = items[0];

      if (!paymentItem || paymentItem.status !== "captured") {
        await paymentDetailsModel.findByIdAndUpdate(
          paymentRecord._id,
          { paymentStatus: "failed" },
          { session }
        );
        throw new ApiError(400, "Payment not captured");
      }

      // Amount verification
      const razorpayAmount = paymentItem.amount / 100;
      const expectedAmount = paymentRecord.amount;

      console.log("💰 Amount verification:", {
        razorpayAmount,
        expectedAmount,
        difference: Math.abs(razorpayAmount - expectedAmount),
      });

      if (Math.abs(razorpayAmount - expectedAmount) > 0.01) {
        await paymentDetailsModel.findByIdAndUpdate(
          paymentRecord._id,
          { paymentStatus: "failed" },
          { session }
        );
        throw new ApiError(400, "Payment amount mismatch");
      }

      // Update payment record
      const updatedPaymentRecord = await paymentDetailsModel.findByIdAndUpdate(
        paymentRecord._id,
        {
          razorpayPaymentId: razorpay_payment_id,
          paymentStatus: "paid",
          verifiedAt: new Date(),
          pendingPaymentExpiry: null,
          securityChecks: {
            signatureVerified: true,
            amountVerified: true,
            expiryVerified: true,
            captureVerified: true,
          },
        },
        { new: true, session }
      );

      // Update order
      const order = await orderDetailsModel.findByIdAndUpdate(
        paymentRecord.orderId,
        {
          orderStatus: "Ordered",
          paymentStatus: "Completed",
          expiresAt: null,
          orderConfirmedAt: new Date(),
        },
        { new: true, session }
      );

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      // Update stock securely
      await this.updateStockSecure(order, session);

      // Clear cart
      await cart.findOneAndDelete({ userId }).session(session);

      await session.commitTransaction();

      console.log("✅ Razorpay verification completed successfully");
      logger.info("Razorpay verification successful", {
        orderId: order.orderId,
      });

      return {
        success: true,
        message: "Payment verified successfully",
        data: {
          paymentRecord: updatedPaymentRecord,
          order,
          amount: razorpayAmount,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      console.error("💥 Razorpay verification failed:", error.message);
      logger.error("Razorpay verification failed", { error: error.message });

      if (error.message.includes("expired")) {
        throw new ApiError(400, "Payment session expired. Please try again.");
      } else if (error.message.includes("amount mismatch")) {
        throw new ApiError(400, "Payment amount verification failed.");
      } else if (error.message.includes("already processed")) {
        throw new ApiError(400, "Payment already processed.");
      } else if (error.message.includes("configuration error")) {
        throw new ApiError(500, "Payment system configuration error.");
      } else {
        throw new ApiError(500, "Payment verification failed", error.message);
      }
    } finally {
      session.endSession();
    }
  }


  /**
 * NEW: Helper method to normalize product types consistently
 */
normalizeProductType(productType) {
  console.log([productType,"thid id is the pdicut type i have"]);
  
  if (!productType) return "nonVariation";
  
  const normalized = productType.toLowerCase();
  
  // Map all variations of variant types to standard enum values
  if (normalized === "variant" || normalized === "variation") {
    return "variation";
  }
  
  if (normalized === "nonvariant" || normalized === "nonvariation") {
    return "nonVariation";
  }
  
  return productType;
}

  /**
   * Secure stock update for new product structure
   */
async updateStockSecure(order, session) {
  console.log("📦 Updating stock for order:", order.orderId);
  

  const stockUpdates = order.orderDetails[0].products.map(
    
    async (productItem) => {
      if (productItem.isFreeProduct) {
  console.log("🎁 Processing free product stock");
}
      const product = await Product.findById(productItem.productId).session(
        session
      );
      if (!product) {
        throw new ApiError(404, `Product ${productItem.productId} not found`);
      }

      // ✅ FIX: Normalize product type BEFORE using it
      const normalizedProductType = this.normalizeProductType(productItem.productType);

      console.log("🔄 Updating stock for:", {
        productId: productItem.productId,
        variantId: productItem.variantId,
        originalProductType: productItem.productType,
        normalizedProductType: normalizedProductType,
        quantity: productItem.quantity,
      });

      if (
        normalizedProductType === "nonVariation" ||
        normalizedProductType === "nonVariant"
      ) {
        // Update non-variant product stock
        if (
          !product.nonVariant ||
          product.nonVariant.stockCount < productItem.quantity
        ) {
          throw new ApiError(
            400,
            `Insufficient stock for product ${product.productName}`
          );
        }

        product.nonVariant.stockCount -= productItem.quantity;
      } else {
        // Update variant product stock
        const variant = this.findProductVariant(
          product,
          productItem.variantId,
          normalizedProductType
        );
        if (!variant || variant.stockCount < productItem.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for variant ${productItem.variantId} of ${product.productName}`
          );
        }

        variant.stockCount -= productItem.quantity;
      }

      await product.save({ session });
      console.log(`✅ Stock updated for product ${product.productName}`);
    }
  );

  await Promise.all(stockUpdates);
  console.log("✅ All stock updates completed");
}

  /**
   * Get user with addresses - ensure all required fields are present
   */
  async getUserWithAddresses(userId, orderData, isBuyNow) {
    console.log("🔍 [getUserWithAddresses] Starting method execution");

    // Select all necessary fields including phone and fullName
    const user = await User.findById(userId)
      .select("email fullName phone address billingAddressId deliveryAddressId")
      .lean();

    console.log("👤 [getUserWithAddresses] User data:", {
      userId: user?._id,
      email: user?.email,
      fullName: user?.fullName,
      phone: user?.phone,
      hasAddress: !!user?.address,
      addressCount: user?.address?.length || 0,
    });

    if (!user) {
      console.error("❌ [getUserWithAddresses] User not found for ID:", userId);
      throw new ApiError(404, "User not found");
    }

    // Ensure we have fallback values for required fields
    const userData = {
      ...user,
      email: user.email || "no-email@example.com",
      fullName: user.fullName || "Customer",
      phone: user.phone || "Not Provided",
    };

    const billingAddressId = isBuyNow
      ? orderData.billingAddressId
      : user.billingAddressId ||
        user.address?.find((addr) => addr.checkoutAddress === "billingAddress" || "deliveryAddress")
          ?._id;

    const deliveryAddressId = isBuyNow
      ? orderData.deliveryAddressId
      : user.deliveryAddressId ||
        user.address?.find((addr) => addr.checkoutAddress === "deliveryAddress" || "billingAddress")
          ?._id;

    console.log("📍 [getUserWithAddresses] Address IDs:", {
      isBuyNow,
      billingAddressId,
      deliveryAddressId,
      userBillingAddressId: user.billingAddressId,
      userDeliveryAddressId: user.deliveryAddressId,
    });

    // Log all available addresses for debugging
    console.log(
      "🏠 [getUserWithAddresses] All user addresses:",
      user.address?.map((addr) => ({
        _id: addr._id,
        addressType: addr.addressType,
        fullName: addr.fullName,
      })) || "No addresses found"
    );

    const billingAddress = user.address?.find(
      (addr) => addr._id.toString() === billingAddressId?.toString()
    );

    const deliveryAddress = user.address?.find(
      (addr) => addr._id.toString() === deliveryAddressId?.toString()
    );

    console.log("✅ [getUserWithAddresses] Address lookup results:", {
      billingAddressFound: !!billingAddress,
      deliveryAddressFound: !!deliveryAddress,
      billingAddressId: billingAddressId,
      deliveryAddressId: deliveryAddressId,
      billingAddressDetails: billingAddress
        ? {
            _id: billingAddress._id,
            addressType: billingAddress.addressType,
            fullName: billingAddress.fullName,
          }
        : null,
      deliveryAddressDetails: deliveryAddress
        ? {
            _id: deliveryAddress._id,
            addressType: deliveryAddress.addressType,
            fullName: deliveryAddress.fullName,
          }
        : null,
    });

    if (!billingAddress || !deliveryAddress) {
      console.error("❌ [getUserWithAddresses] Addresses not found:", {
        missingBilling: !billingAddress,
        missingDelivery: !deliveryAddress,
        billingAddressId,
        deliveryAddressId,
        availableAddressIds:
          user.address?.map((addr) => addr._id.toString()) || [],
      });
      throw new ApiError(404, "Addresses not found");
    }

    console.log("🎯 [getUserWithAddresses] Successfully retrieved addresses");

return {
  ...userData,
  billingAddress: this.normalizeAddress(billingAddress),
  deliveryAddress: this.normalizeAddress(deliveryAddress),
};
  }

  // Utility methods
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getNextSteps(paymentMethod) {
    const steps = {
      RazorPay: "Complete payment via Razorpay",
      Stripe: "Complete payment via Stripe",
      PayPal: "Complete payment via PayPal",
      COD: "Order confirmed. Payment on delivery",
    };
    return steps[paymentMethod] || "Complete your order";
  }

  // Helper methods
  validateUser(user) {
    if (!user?._id) throw new ApiError(401, "Unauthorized");
    return user._id;
  }

  async notifyOrderFailure(error, userId) {
    console.log("📢 Notifying order failure for user:", userId);
  }
}

module.exports = new OrderService();