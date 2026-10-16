const { Product } = require("../models/Product.model");
const { orderDetailsModel: defaultOrderDetailsModel } = require("../models/orders.model");

/**
 * Check if a product variant or non-variant has an existing discount
 */
const isItemDiscounted = (product, item = {}) => {
  if (!product) return false;

  // Variant product
  if (item.productType === "variant" || item.productType === "variation") {
    const variant = (() => {
      const v = product.variant;
      if (!v) return null;

      if (v.variantType === "unitOnly" && Array.isArray(v.unitOnlyVariants)) {
        return v.unitOnlyVariants.find((x) => String(x._id) === String(item.variantId));
      }
      if (v.variantType === "sizeColor" && Array.isArray(v.sizeColorVariants)) {
        return v.sizeColorVariants.find((x) => String(x._id) === String(item.variantId));
      }
      if (v.variantType === "sizeOnly" && Array.isArray(v.sizeOnlyVariants)) {
        return v.sizeOnlyVariants.find((x) => String(x._id) === String(item.variantId));
      }
      if (v.variantType === "colorOnly" && Array.isArray(v.colorOnlyVariants)) {
        return v.colorOnlyVariants.find((x) => String(x._id) === String(item.variantId));
      }
      return null;
    })();

    if (!variant) return false;

    const discount = Number(variant.price?.discount || 0);
    const costPrice = Number(variant.price?.costPrice || 0);
    const salePrice = Number(variant.price?.salePrice || 0);
    return discount > 0 || (costPrice > 0 && salePrice > 0 && costPrice > salePrice);
  }

  // Non-variant product
  if (item.productType === "nonVariant" || item.productType === "nonVariation" || product.productType === "nonVariant") {
    const discount = Number(product.nonVariant?.price?.discount || 0);
    const costPrice = Number(product.nonVariant?.price?.costPrice || 0);
    const salePrice = Number(product.nonVariant?.price?.salePrice || 0);
    return discount > 0 || (costPrice > 0 && salePrice > 0 && costPrice > salePrice);
  }

  return false;
};

/**
 * Check if a product directly has discounts (for product detail / listing view)
 */
const isProductDiscountedDirect = (product) => {
  if (!product) return false;

  if (product.productType === "nonVariant") {
    const discount = Number(product.nonVariant?.price?.discount || 0);
    const costPrice = Number(product.nonVariant?.price?.costPrice || 0);
    const salePrice = Number(product.nonVariant?.price?.salePrice || 0);
    return discount > 0 || (costPrice > 0 && salePrice > 0 && costPrice > salePrice);
  }

  // For variant products, check if all variants have discounts
  if (product.productType === "variant" && product.variant) {
    const variants = product.variant.unitOnlyVariants ||
      product.variant.sizeColorVariants ||
      product.variant.sizeOnlyVariants ||
      product.variant.colorOnlyVariants || [];

    if (variants.length > 0) {
      // If at least one variant is not discounted, coupon can potentially apply
      const hasNonDiscountedVariant = variants.some((v) => {
        const discount = Number(v.price?.discount || 0);
        const costPrice = Number(v.price?.costPrice || 0);
        const salePrice = Number(v.price?.salePrice || 0);
        return discount <= 0 && !(costPrice > 0 && salePrice > 0 && costPrice > salePrice);
      });
      return !hasNonDiscountedVariant;
    }
  }

  return false;
};

/**
 * Check if an item matches the coupon's product/category applicability rules
 */
const isItemApplicableToCoupon = (item, product, coupon) => {
  if (!coupon) return false;

  const applicabilityType = coupon.applicabilityType || "ALL_PRODUCTS";

  // Case 1: ALL_PRODUCTS
  if (applicabilityType === "ALL_PRODUCTS") {
    return true;
  }

  const productId = String(item.productId || product?._id || "");

  // Case 2: SELECTED_PRODUCTS
  if (applicabilityType === "SELECTED_PRODUCTS") {
    const productIds = Array.isArray(coupon.applicableProductIds)
      ? coupon.applicableProductIds.map(String)
      : Array.isArray(coupon.conditions?.applicableProductIds)
      ? coupon.conditions.applicableProductIds.map(String)
      : [];

    return productIds.includes(productId);
  }

  // Case 3: CONDITIONAL
  if (applicabilityType === "CONDITIONAL") {
    const productIds = [
      ...(Array.isArray(coupon.applicableProductIds) ? coupon.applicableProductIds : []),
      ...(Array.isArray(coupon.conditions?.applicableProductIds) ? coupon.conditions.applicableProductIds : []),
    ].map(String);

    const categories = [
      ...(Array.isArray(coupon.applicableCategories) ? coupon.applicableCategories : []),
      ...(Array.isArray(coupon.conditions?.applicableCategories) ? coupon.conditions.applicableCategories : []),
    ].map((c) => String(c).trim().toLowerCase());

    let productMatches = true;
    let categoryMatches = true;

    if (productIds.length > 0) {
      productMatches = productIds.includes(productId);
    }

    if (categories.length > 0) {
      const productCatId = String(product?.category_id || "").toLowerCase();
      const productCatName = String(product?.productCategory || "").toLowerCase();
      categoryMatches = categories.some((c) => c === productCatId || c === productCatName);
    }

    // Both configured filters must match if specified
    return productMatches && categoryMatches;
  }

  return true;
};

/**
 * Authoritative backend eligibility evaluator for a cart or set of items
 *
 * @param {object} params
 * @param {object} params.coupon - Coupon document or plain object
 * @param {Array} params.items - Cart items or buy-now items
 * @param {object} [params.user] - Authenticated user object or { _id }
 * @param {Date} [params.now] - Current timestamp
 * @param {object} [params.orderDetailsModel] - Orders model
 * @param {Map|object} [params.productMap] - Optional pre-fetched map of Product docs by id
 * @returns {Promise<object>} Evaluation result
 */
const evaluateCouponEligibility = async ({
  coupon,
  items = [],
  user = null,
  now = new Date(),
  orderDetailsModel = defaultOrderDetailsModel,
  productMap = null,
}) => {
  if (!coupon) {
    return {
      isEligible: false,
      reason: "Coupon not found",
      discountAmount: 0,
      eligibleItems: [],
      eligibleSubtotal: 0,
      cartSubtotal: 0,
      freeProduct: null,
      couponDetails: null,
    };
  }

  const couponCode = coupon.code;

  // 1. Status Check
  if (coupon.status !== "active") {
    return {
      isEligible: false,
      reason: "Coupon is currently inactive",
      discountAmount: 0,
      eligibleItems: [],
      eligibleSubtotal: 0,
      cartSubtotal: 0,
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  // 2. Validity Date Check
  const validFrom = new Date(coupon.validFrom);
  const validUntil = new Date(coupon.validUntil);

  if (now < validFrom) {
    return {
      isEligible: false,
      reason: `Coupon is not active yet (starts on ${validFrom.toLocaleDateString("en-IN")})`,
      discountAmount: 0,
      eligibleItems: [],
      eligibleSubtotal: 0,
      cartSubtotal: 0,
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  if (now > validUntil) {
    return {
      isEligible: false,
      reason: "Coupon has expired",
      discountAmount: 0,
      eligibleItems: [],
      eligibleSubtotal: 0,
      cartSubtotal: 0,
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  // 3. Usage Limit Check
  const usageCount = Number(coupon.usageCount || 0);
  const usageLimit = Number(coupon.usageLimit || 0);
  if (usageLimit > 0 && usageCount >= usageLimit) {
    return {
      isEligible: false,
      reason: "Coupon usage limit has been reached",
      discountAmount: 0,
      eligibleItems: [],
      eligibleSubtotal: 0,
      cartSubtotal: 0,
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  // 4. Repeat Usage Check (User specific)
  const userId = user?._id || user?.id || null;
  if (coupon.repeatUsage === "notAllowed" && userId && orderDetailsModel) {
    const existingUsage = await orderDetailsModel.findOne({
      userId,
      orderStatus: { $ne: "Cancelled" },
      $or: [
        { "orderDetails.couponCode": couponCode },
        { "coupon.code": couponCode },
      ],
    }).lean();

    if (existingUsage) {
      return {
        isEligible: false,
        reason: "You have already used this coupon",
        discountAmount: 0,
        eligibleItems: [],
        eligibleSubtotal: 0,
        cartSubtotal: 0,
        freeProduct: null,
        couponDetails: coupon,
      };
    }
  }

  // 5. First Order Only Check
  const isFirstOrderOnly = Boolean(coupon.firstOrderOnly || coupon.conditions?.firstOrderOnly);
  if (isFirstOrderOnly && userId && orderDetailsModel) {
    const previousOrder = await orderDetailsModel.findOne({
      userId,
      orderStatus: { $nin: ["Cancelled", "Pending"] },
    }).lean();

    if (previousOrder) {
      return {
        isEligible: false,
        reason: "This coupon is only valid for your first order",
        discountAmount: 0,
        eligibleItems: [],
        eligibleSubtotal: 0,
        cartSubtotal: 0,
        freeProduct: null,
        couponDetails: coupon,
      };
    }
  }

  if (!items || items.length === 0) {
    return {
      isEligible: false,
      reason: "Cart is empty",
      discountAmount: 0,
      eligibleItems: [],
      eligibleSubtotal: 0,
      cartSubtotal: 0,
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  // 6. Resolve Products & Evaluate Item Eligibility
  let cartSubtotal = 0;
  let eligibleSubtotal = 0;
  let eligibleQuantity = 0;
  const eligibleItems = [];
  let hadApplicableDiscountedItems = false;
  let hadApplicableItems = false;

  for (const item of items) {
    const productId = String(item.productId || item._id || "");
    const qty = Number(item.quantity || 1);
    const itemPrice = Number(
      item.priceBreakdown?.salePrice ?? item.price?.salePrice ?? item.price ?? item.salePrice ?? 0
    );
    const itemSubtotal = itemPrice * qty;
    cartSubtotal += itemSubtotal;

    let productDoc = null;
    if (productMap) {
      productDoc = productMap.get ? productMap.get(productId) : productMap[productId];
    }
    if (!productDoc) {
      try {
        productDoc = await Product.findById(productId).lean();
      } catch (err) {
        // Ignored
      }
    }

    const matchesApplicability = isItemApplicableToCoupon(item, productDoc, coupon);

    if (matchesApplicability) {
      hadApplicableItems = true;
      const isDiscounted = isItemDiscounted(productDoc, item);

      if (isDiscounted) {
        hadApplicableDiscountedItems = true;
      } else {
        eligibleItems.push({
          ...item,
          productId,
          resolvedPrice: itemPrice,
          resolvedSubtotal: itemSubtotal,
          quantity: qty,
          productDoc,
        });
        eligibleSubtotal += itemSubtotal;
        eligibleQuantity += qty;
      }
    }
  }

  // 7. Check if any items qualified
  if (eligibleItems.length === 0) {
    let reason = "This coupon is not applicable to the products in your cart";
    if (hadApplicableDiscountedItems) {
      reason = "Coupon cannot be applied on already discounted products";
    }
    return {
      isEligible: false,
      reason,
      discountAmount: 0,
      eligibleItems: [],
      eligibleSubtotal: 0,
      cartSubtotal: Number(cartSubtotal.toFixed(2)),
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  // 8. Minimum Purchase Condition Check
  const minPurchaseAmount = Number(
    coupon.minPurchaseAmount || coupon.conditions?.minSubtotal || 0
  );
  if (minPurchaseAmount > 0 && eligibleSubtotal < minPurchaseAmount) {
    return {
      isEligible: false,
      reason: `Minimum purchase of ₹${minPurchaseAmount} required on eligible products (current: ₹${eligibleSubtotal.toFixed(2)})`,
      discountAmount: 0,
      eligibleItems,
      eligibleSubtotal: Number(eligibleSubtotal.toFixed(2)),
      cartSubtotal: Number(cartSubtotal.toFixed(2)),
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  // 9. Minimum Quantity Condition Check
  const minQuantity = Number(coupon.conditions?.minQuantity || 0);
  if (minQuantity > 0 && eligibleQuantity < minQuantity) {
    return {
      isEligible: false,
      reason: `Minimum ${minQuantity} eligible item(s) required (current: ${eligibleQuantity})`,
      discountAmount: 0,
      eligibleItems,
      eligibleSubtotal: Number(eligibleSubtotal.toFixed(2)),
      cartSubtotal: Number(cartSubtotal.toFixed(2)),
      freeProduct: null,
      couponDetails: coupon,
    };
  }

  // 10. Calculate Discount Amount
  let discountAmount = 0;
  let freeProduct = null;

  if (coupon.offerType === "DISCOUNT") {
    if (coupon.discountType === "percentage") {
      discountAmount = (Number(coupon.discountValue || 0) / 100) * eligibleSubtotal;
      const maxDiscount = Number(coupon.maxDiscountAmount || 0);
      if (maxDiscount > 0 && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = Number(coupon.discountValue || 0);
    }

    // Safe cap: discount cannot exceed eligible subtotal
    discountAmount = Math.min(discountAmount, eligibleSubtotal);
    discountAmount = Number(discountAmount.toFixed(2));
  } else if (coupon.offerType === "FREE_PRODUCT") {
    discountAmount = 0;
    const free = coupon.freeProduct;

    if (free?.productId) {
      try {
        const freeProductDoc = await Product.findById(free.productId).lean();
        if (freeProductDoc) {
          freeProduct = {
            productId: free.productId,
            variantId: free.variantId || null,
            productType: free.productType || "nonVariant",
            quantity: 1,
            productName: freeProductDoc.productName,
            productImage: null,
            variantDetails: null,
            price: 0,
            isFree: true,
          };

          if (free.productType === "variant" && free.variantId && freeProductDoc.variant) {
            const v = (freeProductDoc.variant.unitOnlyVariants || []).find(
              (x) => String(x._id) === String(free.variantId)
            );
            if (v) {
              freeProduct.variantDetails = {
                unit: v.unit,
                displayName: v.unit,
              };
              freeProduct.price = Number(v.price?.salePrice || 0);
              freeProduct.productImage = v.variantImages?.[0] || freeProductDoc.productImages?.[0] || null;
            }
          } else {
            freeProduct.price = Number(freeProductDoc.nonVariant?.price?.salePrice || 0);
            freeProduct.productImage = freeProductDoc.nonVariant?.nonVariantImages?.[0] || freeProductDoc.productImages?.[0] || null;
          }
        }
      } catch (err) {
        // Free product resolution fallback
      }
    }
  }

  return {
    isEligible: true,
    reason: null,
    discountAmount,
    eligibleItems,
    eligibleSubtotal: Number(eligibleSubtotal.toFixed(2)),
    cartSubtotal: Number(cartSubtotal.toFixed(2)),
    freeProduct,
    couponDetails: {
      _id: coupon._id,
      code: coupon.code,
      message: coupon.message,
      offerType: coupon.offerType,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minPurchaseAmount: coupon.minPurchaseAmount,
      applicabilityType: coupon.applicabilityType || "ALL_PRODUCTS",
      freeProduct: coupon.freeProduct,
      firstOrderOnly: coupon.firstOrderOnly,
      cashBack: coupon.cashBack,
    },
  };
};

/**
 * Evaluate whether an active coupon applies to a single product (for product listing & detail pages)
 */
const evaluateProductCoupon = ({ coupon, product, now = new Date() }) => {
  if (!coupon || coupon.status !== "active" || !product) {
    return { applies: false };
  }

  const validFrom = new Date(coupon.validFrom);
  const validUntil = new Date(coupon.validUntil);
  if (now < validFrom || now > validUntil) {
    return { applies: false };
  }

  // Usage limit exhausted check
  if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
    return { applies: false };
  }

  // Check if product is already discounted
  if (isProductDiscountedDirect(product)) {
    return { applies: false, reason: "Already discounted" };
  }

  // Check applicability
  const dummyItem = {
    productId: product._id,
    productType: product.productType,
  };
  if (!isItemApplicableToCoupon(dummyItem, product, coupon)) {
    return { applies: false };
  }

  // Construct readable qualified labels
  const isFreeProduct = coupon.offerType === "FREE_PRODUCT";
  let offerLabel = "";
  if (isFreeProduct) {
    offerLabel = "Free Product Offer";
  } else if (coupon.discountType === "percentage") {
    offerLabel = `${coupon.discountValue}% OFF`;
    if (coupon.maxDiscountAmount > 0) {
      offerLabel += ` (Up to ₹${coupon.maxDiscountAmount})`;
    }
  } else {
    offerLabel = `₹${coupon.discountValue} OFF`;
  }

  const minPurchase = Number(coupon.minPurchaseAmount || coupon.conditions?.minSubtotal || 0);
  const conditionTexts = [];

  if (minPurchase > 0) {
    conditionTexts.push(`Min. order ₹${minPurchase}`);
  }
  if (coupon.firstOrderOnly || coupon.conditions?.firstOrderOnly) {
    conditionTexts.push("First order only");
  }
  if (coupon.conditions?.minQuantity > 1) {
    conditionTexts.push(`Min. ${coupon.conditions.minQuantity} items`);
  }

  return {
    applies: true,
    code: coupon.code,
    message: coupon.message,
    offerLabel,
    conditionText: conditionTexts.join(" • ") || "No minimum order",
    minPurchaseAmount: minPurchase,
    firstOrderOnly: Boolean(coupon.firstOrderOnly || coupon.conditions?.firstOrderOnly),
    offerType: coupon.offerType,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    couponImage: coupon.couponImage,
  };
};

module.exports = {
  isItemDiscounted,
  isProductDiscountedDirect,
  isItemApplicableToCoupon,
  evaluateCouponEligibility,
  evaluateProductCoupon,
};
