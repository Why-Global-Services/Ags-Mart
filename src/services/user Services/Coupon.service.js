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

      if (v.variantType === "sizeColor") {
        return v.sizeColorVariants.find(x => x._id == item.variantId);
      }
      if (v.variantType === "sizeOnly") {
        return v.sizeOnlyVariants.find(x => x._id == item.variantId);
      }
      if (v.variantType === "colorOnly") {
        return v.colorOnlyVariants.find(x => x._id == item.variantId);
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

        if (variantType === "sizeColor") {
          found = product.variant.sizeColorVariants.find(
            (v) => v._id == item.variantId
          );
        }

        if (variantType === "sizeOnly") {
          found = product.variant.sizeOnlyVariants.find(
            (v) => v._id == item.variantId
          );
        }

        if (variantType === "colorOnly") {
          found = product.variant.colorOnlyVariants.find(
            (v) => v._id == item.variantId
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

        if (variant?.variantType === "sizeColor") {
          selectedVariant = variant.sizeColorVariants?.find(
            (v) => v._id === free.variantId
          );
          if (selectedVariant) {
            freeProduct.variantDetails = {
              size: selectedVariant.size,
              color: selectedVariant.color,
              displayName: `${selectedVariant.size} - ${selectedVariant.color}`,
            };
          }
        } else if (variant?.variantType === "colorOnly") {
          selectedVariant = variant.colorOnlyVariants?.find(
            (v) => v._id === free.variantId
          );
          if (selectedVariant) {
            freeProduct.variantDetails = {
              color: selectedVariant.color,
              displayName: selectedVariant.color,
            };
          }
        } else if (variant?.variantType === "sizeOnly") {
          selectedVariant = variant.sizeOnlyVariants?.find(
            (v) => v._id === free.variantId
          );
          if (selectedVariant) {
            freeProduct.variantDetails = {
              size: selectedVariant.size,
              displayName: selectedVariant.size,
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

  // if (coupon.offerType === "FREE_PRODUCT" && coupon.freeProduct?.productId) {
  //         try {
  //           const product = await Product.findById(coupon.freeProduct.productId).lean();
            
  //           if (product) {
  //             let freeProductDetails = {
  //               productId: product._id,
  //               productName: product.productName,
  //               productType: coupon.freeProduct.productType,
  //               productImage: null,
  //               variantDetails: null,
  //               price: 0,
  //             };
  
  //             // Get variant-specific details
  //             if (coupon.freeProduct.productType === "variant" && coupon.freeProduct.variantId) {
  //               const variant = product.variant;
  //               let selectedVariant = null;
  
  //               if (variant?.variantType === "sizeColor") {
  //                 selectedVariant = variant.sizeColorVariants?.find(
  //                   (v) => v._id === coupon.freeProduct.variantId
  //                 );
  //                 if (selectedVariant) {
  //                   freeProductDetails.variantDetails = {
  //                     size: selectedVariant.size,
  //                     color: selectedVariant.color,
  //                     displayName: `${selectedVariant.size} - ${selectedVariant.color}`,
  //                   };
  //                 }
  //               } else if (variant?.variantType === "colorOnly") {
  //                 selectedVariant = variant.colorOnlyVariants?.find(
  //                   (v) => v._id === coupon.freeProduct.variantId
  //                 );
  //                 if (selectedVariant) {
  //                   freeProductDetails.variantDetails = {
  //                     color: selectedVariant.color,
  //                     displayName: selectedVariant.color,
  //                   };
  //                 }
  //               } else if (variant?.variantType === "sizeOnly") {
  //                 selectedVariant = variant.sizeOnlyVariants?.find(
  //                   (v) => v._id === coupon.freeProduct.variantId
  //                 );
  //                 if (selectedVariant) {
  //                   freeProductDetails.variantDetails = {
  //                     size: selectedVariant.size,
  //                     displayName: selectedVariant.size,
  //                   };
  //                 }
  //               }
  
  //               // Get variant image or fallback to product images
  //               if (selectedVariant?.variantImages?.length) {
  //                 freeProductDetails.productImage = selectedVariant.variantImages[0];
  //               } else if (product.productImages?.length) {
  //                 freeProductDetails.productImage = product.productImages[0];
  //               }
  
  //               freeProductDetails.price = selectedVariant?.price?.salePrice || 0;
  //             } else if (coupon.freeProduct.productType === "nonVariant") {
  //               // Non-variant product
  //               if (product.nonVariant?.nonVariantImages?.length) {
  //                 freeProductDetails.productImage = product.nonVariant.nonVariantImages[0];
  //               } else if (product.productImages?.length) {
  //                 freeProductDetails.productImage = product.productImages[0];
  //               }
  
  //               freeProductDetails.price = product.nonVariant?.price?.salePrice || 0;
  //             }
  
  //             return {
  //               ...coupon,
  //               freeProductDetails, // Add enriched product details
  //             };
  //           }
  //         } catch (err) {
  //           console.error("Error fetching free product details:", err);
  //         }
  //       }

  return {
    success: true,
    message: "Active coupons fetched successfully",
    data: coupon,
  };
};

module.exports = { Coupon, getCoupon };