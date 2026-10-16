const httpStatus = require("http-status");
const { cart } = require("../../models/cart.model");
const { CouponModel } = require("../../models/coupons.model");
const { orderDetailsModel } = require("../../models/orders.model");
const { Product } = require("../../models/Product.model");
const ApiError = require("../../utils/apiError");
const logger = require("../../config/logger");
const {
  evaluateCouponEligibility,
  evaluateProductCoupon,
  isItemDiscounted,
} = require("../../utils/couponEligibility");

/**
 * Validate and apply coupon for user cart or buy-now items
 */
const Coupon = async (req) => {
  const userId = req.user?._id;
  const { couponCode, isBuyNow, buyNowItem, cartItems } = req.body;

  if (!couponCode || !String(couponCode).trim()) {
    throw new ApiError(400, "Coupon code is required");
  }

  const cleanCode = String(couponCode).trim().toUpperCase();

  /* ---------------- ITEMS RESOLUTION ---------------- */
  let items = [];

  if (isBuyNow && buyNowItem) {
    items = [buyNowItem];
  } else if (Array.isArray(cartItems) && cartItems.length > 0) {
    items = cartItems;
  } else if (userId) {
    const userCart = await cart.findOne({ userId });
    items = userCart?.items || [];
  }

  if (!items || !items.length) {
    throw new ApiError(400, "No items found in cart to apply coupon");
  }

  /* ---------------- COUPON LOOKUP ---------------- */
  const couponDoc = await CouponModel.findOne({ code: cleanCode });

  if (!couponDoc) {
    throw new ApiError(400, "Invalid Coupon Code");
  }

  /* ---------------- ELIGIBILITY EVALUATION ---------------- */
  const evalResult = await evaluateCouponEligibility({
    coupon: couponDoc,
    items,
    user: req.user,
    orderDetailsModel,
  });

  if (!evalResult.isEligible) {
    throw new ApiError(400, evalResult.reason || "Coupon is not applicable");
  }

  /* ---------------- ENRICH CART ITEMS FOR RESPONSE ---------------- */
  const productDetails = await Promise.all(
    items.map(async (item) => {
      const productId = item.productId || item._id;
      const product = await Product.findById(productId);
      if (!product) return null;

      let salePrice = 0;

      if (item.productType === "variant" || item.productType === "variation") {
        let found = null;
        const { variantType } = product.variant || {};

        if (variantType === "unitOnly") {
          found = product.variant.unitOnlyVariants?.find(
            (v) => String(v._id) === String(item.variantId)
          );
        } else if (variantType === "sizeColor") {
          found = product.variant.sizeColorVariants?.find(
            (v) => String(v._id) === String(item.variantId)
          );
        } else if (variantType === "sizeOnly") {
          found = product.variant.sizeOnlyVariants?.find(
            (v) => String(v._id) === String(item.variantId)
          );
        } else if (variantType === "colorOnly") {
          found = product.variant.colorOnlyVariants?.find(
            (v) => String(v._id) === String(item.variantId)
          );
        }

        salePrice = found?.price?.salePrice || item.priceBreakdown?.salePrice || item.price || 0;
      } else {
        salePrice = product.nonVariant?.price?.salePrice || item.priceBreakdown?.salePrice || item.price || 0;
      }

      const qty = item.quantity || 1;
      const subtotal = salePrice * qty;

      return {
        productId,
        variantId: item.variantId || null,
        productType: item.productType,
        productName: product.productName,
        quantity: qty,
        salePrice,
        subtotal,
      };
    })
  );

  /* ---------------- TOTALS CALCULATION ---------------- */
  const totalPrice = evalResult.cartSubtotal;
  const discountAmount = evalResult.discountAmount;
  const freeProduct = evalResult.freeProduct;

  const discountedTotal = Math.max(0, totalPrice - discountAmount);

  const DEFAULT_SHIPPING =
    process.env.DEFAULT_SHIPPING_CHARGE !== undefined
      ? Number(process.env.DEFAULT_SHIPPING_CHARGE)
      : 50;

  const shippingCharge = DEFAULT_SHIPPING;
  const finalPrice = Number((discountedTotal + shippingCharge).toFixed(2));

  return {
    success: true,
    message: "Offer Applied",
    data: {
      couponInfo: {
        code: couponDoc.code,
        type: couponDoc.offerType,
        discountAmount,
        freeProduct,
        applicabilityType: couponDoc.applicabilityType,
      },
      totals: {
        subtotal: Number(totalPrice.toFixed(2)),
        eligibleSubtotal: Number(evalResult.eligibleSubtotal.toFixed(2)),
        discount: discountAmount,
        shipping: shippingCharge,
        total: finalPrice,
      },
      items: productDetails.filter(Boolean),
      freeProduct,
    },
  };
};

/**
 * Fetch all active, valid coupons
 */
const getCoupon = async (req) => {
  const now = new Date();
  const coupons = await CouponModel.find({
    status: "active",
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  }).sort({ createdAt: -1 });

  return {
    success: true,
    message: "Active coupons fetched successfully",
    data: coupons,
  };
};

/**
 * Get coupons applicable to a specific product
 */
const getProductCoupons = async (req) => {
  const { productId } = req.params;
  const now = new Date();

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const activeCoupons = await CouponModel.find({
    status: "active",
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  }).sort({ createdAt: -1 }).lean();

  const applicableCoupons = [];

  for (const coupon of activeCoupons) {
    const evalRes = evaluateProductCoupon({ coupon, product, now });
    if (evalRes.applies) {
      applicableCoupons.push({
        _id: coupon._id,
        code: coupon.code,
        message: coupon.message,
        offerType: coupon.offerType,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minPurchaseAmount: coupon.minPurchaseAmount,
        couponImage: coupon.couponImage,
        offerLabel: evalRes.offerLabel,
        conditionText: evalRes.conditionText,
        firstOrderOnly: evalRes.firstOrderOnly,
      });
    }
  }

  return {
    success: true,
    message: "Product coupons fetched successfully",
    data: applicableCoupons,
  };
};

/**
 * Evaluate all active coupons against current cart / buy-now items and user
 */
const getEligibleCouponsForCart = async (req) => {
  const userId = req.user?._id;
  const { isBuyNow, buyNowItem, cartItems } = req.body || {};
  const now = new Date();

  let items = [];
  if (isBuyNow && buyNowItem) {
    items = [buyNowItem];
  } else if (Array.isArray(cartItems) && cartItems.length > 0) {
    items = cartItems;
  } else if (userId) {
    const userCart = await cart.findOne({ userId });
    items = userCart?.items || [];
  }

  const activeCoupons = await CouponModel.find({
    status: "active",
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  }).sort({ createdAt: -1 }).lean();

  // Preload products for evaluation
  const productIds = items.map((it) => it.productId || it._id).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const evaluatedCoupons = await Promise.all(
    activeCoupons.map(async (coupon) => {
      const evaluation = await evaluateCouponEligibility({
        coupon,
        items,
        user: req.user,
        now,
        orderDetailsModel,
        productMap,
      });

      return {
        _id: coupon._id,
        code: coupon.code,
        message: coupon.message,
        offerType: coupon.offerType,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minPurchaseAmount: coupon.minPurchaseAmount,
        applicabilityType: coupon.applicabilityType || "ALL_PRODUCTS",
        applicableProductIds: coupon.applicableProductIds || [],
        freeProduct: coupon.freeProduct,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        couponImage: coupon.couponImage,
        isEligible: evaluation.isEligible,
        reason: evaluation.reason,
        calculatedDiscount: evaluation.discountAmount,
        freeProductDetails: evaluation.freeProduct,
      };
    })
  );

  return {
    success: true,
    message: "Cart coupons evaluated successfully",
    data: evaluatedCoupons,
  };
};

module.exports = {
  Coupon,
  getCoupon,
  getProductCoupons,
  getEligibleCouponsForCart,
  isProductDiscounted: isItemDiscounted,
};