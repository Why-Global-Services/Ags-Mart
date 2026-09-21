const httpStatus = require("http-status");
const { cart } = require("../../models/cart.model");
const { CouponModel } = require("../../models/coupons.model");
const { orderDetailsModel } = require("../../models/orders.model");
const { Product } = require("../../models/Product.model");
const ApiError = require("../../utils/apiError");
const logger = require("../../config/logger");


const isProductDiscounted = (product, item) => {
  // Variant product
  if (item.productType === "variant") {
    const variant = (() => {
      const v = product.variant;
      if (!v) return null;

      if (v.variantType === "unitOnly") {
        return v.unitOnlyVariants?.find(x => String(x._id) === String(item.variantId));
      }
      return null;
    })();

    if (!variant) return false;

    const { discount } = variant.price || {};
    return discount > 0;
  }

  // Non-variant product
  if (item.productType === "nonVariant") {
    const { discount } = product.nonVariant?.price || {};
    return discount > 0;
  }

  return false;
};


const Coupon = async (req) => {
  const userId = req.user._id;
  const { couponCode } = req.body;

  /* ---------------- CART ---------------- */

  const userCart = await cart.findOne({ userId });

  if (!userCart || !userCart.items.length) {
    throw new ApiError(400, "No items found in cart");
  }




  const items = userCart.items;
  /* ---------------- COUPON ---------------- */

    let hasAnyDiscountedItem = false;

await Promise.all(
  items.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) return;

    if (isProductDiscounted(product, item)) {
      hasAnyDiscountedItem = true;
    }
  })
);

if (hasAnyDiscountedItem) {
  throw new ApiError(
    httpStatus.BAD_REQUEST,
    "Coupon cannot be applied on discounted items"
  );
}


  let getCoupon = null;

  if (couponCode) {
    getCoupon = await CouponModel.findOne({ code: couponCode });

    if (!getCoupon) throw new ApiError(400, "Invalid Coupon Code");

    const now = new Date();

    if (
      getCoupon.status !== "active" ||
      now < getCoupon.validFrom ||
      now > getCoupon.validUntil
    ) {
      throw new ApiError(400, "Coupon expired or inactive");
    }

    /* First order */
    if (getCoupon.firstOrderOnly) {
      const completedOrder = await orderDetailsModel.findOne({
        userId,
        paymentStatus: "Completed",
      });

      if (completedOrder) {
        throw new ApiError(400, "Valid only for first order");
      }
    }

    /* Reuse */
    if (getCoupon.repeatUsage === "notAllowed") {
      const used = await orderDetailsModel.findOne({
        userId,
        "coupon.code": getCoupon.code,
      });

      if (used) throw new ApiError(400, "Already used this coupon");
    }

    /* Limit */
    if (
      getCoupon.usageLimit &&
      getCoupon.usageCount >= getCoupon.usageLimit
    ) {
      throw new ApiError(400, "Coupon limit exceeded");
    }
  }

  /* ---------------- CART TOTAL ---------------- */

  let totalPrice = 0;

  const productDetails = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) return null;

      let salePrice = 0;

      /* Variant */
      if (item.productType === "variant") {
        let found = null;

        const { variantType } = product.variant || {};

        if (variantType === "unitOnly") {
          found = product.variant.unitOnlyVariants?.find(
            (v) => String(v._id) === String(item.variantId)
          );
        }

        if (!found) return null;

        salePrice = found.price.salePrice || 0;
      }

      /* Non Variant */
      if (item.productType === "nonVariant") {
        salePrice = product.nonVariant.price.salePrice || 0;
      }

      const qty = item.quantity || 1;
      const subtotal = salePrice * qty;

      totalPrice += subtotal;

      return {
        productId: item.productId,
        variantId: item.variantId,
        productType: item.productType,
        productName: product.productName,
        quantity: qty,
        salePrice,
        subtotal,
      };
    })
  );

  /* ---------------- MIN PURCHASE ---------------- */

  if (getCoupon && totalPrice < getCoupon.minPurchaseAmount) {
    throw new ApiError(
      400,
      `Minimum ₹${getCoupon.minPurchaseAmount} required`
    );
  }

  /* ---------------- DISCOUNT ---------------- */

  let discountAmount = 0;
  let freeProduct = null;

  if (getCoupon) {
    /* 💰 DISCOUNT */
    if (getCoupon.offerType === "DISCOUNT") {
      if (getCoupon.discountType === "percentage") {
        discountAmount =
          (getCoupon.discountValue / 100) * totalPrice;

        if (
          getCoupon.maxDiscountAmount &&
          discountAmount > getCoupon.maxDiscountAmount
        ) {
          discountAmount = getCoupon.maxDiscountAmount;
        }
      }

      if (getCoupon.discountType === "fixed") {
        discountAmount = getCoupon.discountValue;
      }

      discountAmount = Math.min(discountAmount, totalPrice);
    }

    /* 🎁 FREE PRODUCT */
    if (getCoupon.offerType === "FREE_PRODUCT") {
      const free = getCoupon.freeProduct;

      const product = await Product.findById(free.productId).lean();

      if (!product) {
        throw new ApiError(400, "Free product not found");
      }

      // Initialize free product object
      freeProduct = {
        productId: free.productId,
        variantId: free.variantId,
        productType: free.productType,
        quantity: 1,
        productName: product.productName,
        productImage: null,
        variantDetails: null,
        price: 0,
        isFree: true,
      };

      // Get variant-specific details
      if (free.productType === "variant" && free.variantId) {
        const variant = product.variant;
        let selectedVariant = null;

        if (variant?.variantType === "unitOnly") {
          selectedVariant = variant.unitOnlyVariants?.find(
            (v) => String(v._id) === String(free.variantId)
          );
          if (selectedVariant) {
            freeProduct.variantDetails = {
              unit: selectedVariant.unit,
              displayName: selectedVariant.unit,
            };
          }
        }

        // Get variant image or fallback to product images
        if (selectedVariant?.variantImages?.length) {
          freeProduct.productImage = selectedVariant.variantImages[0];
        } else if (product.productImages?.length) {
          freeProduct.productImage = product.productImages[0];
        }

        freeProduct.price = selectedVariant?.price?.salePrice || 0;
      } else if (free.productType === "nonVariant") {
        // Non-variant product
        if (product.nonVariant?.nonVariantImages?.length) {
          freeProduct.productImage = product.nonVariant.nonVariantImages[0];
        } else if (product.productImages?.length) {
          freeProduct.productImage = product.productImages[0];
        }

        freeProduct.price = product.nonVariant?.price?.salePrice || 0;
      }
    }
  }

  /* ---------------- FINAL TOTAL ---------------- */

  const discountedTotal = totalPrice - discountAmount;

  const shippingCharge = discountedTotal >= 999 ? 0 : 50;

  const finalPrice = discountedTotal + shippingCharge;

  /* ---------------- RESPONSE ---------------- */

  return {
    success: true,
    message: "Offer Applied",

    data: {
      couponInfo: getCoupon
        ? {
            code: getCoupon.code,
            type: getCoupon.offerType,
            discountAmount,
            freeProduct,
          }
        : null,

      totals: {
        subtotal: totalPrice,
        discount: discountAmount,
        shipping: shippingCharge,
        total: finalPrice,
      },

      items: productDetails.filter(Boolean),

      freeProduct, // 👈 send enriched free product to frontend
    },
  };
};


// Fetch active coupons
const getCoupon = async (req) => {
  const coupon = await CouponModel.aggregate([
    { $match: {
      status: "active",
      validFrom: { $lte: new Date()},
      validUntil: { $gte: new Date()}
    },
  },
  {$sample: {size:1}}
  ])



  return {
    success: true,
    message: "Active coupons fetched successfully",
    data: coupon,
  };
};

module.exports = { Coupon, getCoupon };