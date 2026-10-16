/**
 * Helper to determine coupon applicability for individual product cards and product details.
 * Prevents multiple duplicate API calls by filtering coupons already loaded in global Redux store.
 */

export const isCouponValidForProduct = (coupon, product) => {
  if (!coupon || !product) return false;
  if (coupon.status && coupon.status !== "active") return false;

  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return false;
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return false;

  const productId = product._id || product.productId || (typeof product === 'string' ? product : null);
  if (!productId) return false;

  const categoryId =
    product.category?._id ||
    product.category ||
    product.productCategory ||
    product.rawData?.productCategory ||
    product.rawData?.category;

  const type = coupon.applicabilityType || "ALL_PRODUCTS";

  if (type === "SELECTED_PRODUCTS") {
    const list = Array.isArray(coupon.applicableProductIds) ? coupon.applicableProductIds : [];
    if (!list.map(String).includes(String(productId))) {
      return false;
    }
  } else if (type === "CONDITIONAL") {
    const pList = coupon.conditions?.applicableProductIds || coupon.applicableProductIds || [];
    if (Array.isArray(pList) && pList.length > 0) {
      if (!pList.map(String).includes(String(productId))) {
        return false;
      }
    }

    const cList = coupon.conditions?.applicableCategories || coupon.applicableCategories || [];
    if (Array.isArray(cList) && cList.length > 0 && categoryId) {
      if (!cList.map(String).includes(String(categoryId))) {
        return false;
      }
    }
  }

  return true;
};

export const getProductCouponOffer = (coupon, product) => {
  if (!isCouponValidForProduct(coupon, product)) return null;

  let offerTitle = "";
  if (coupon.offerType === "FREE_PRODUCT") {
    offerTitle = "Free Gift";
  } else if (coupon.discountType === "percentage") {
    offerTitle = `${coupon.discountValue}% OFF`;
  } else {
    offerTitle = `₹${coupon.discountValue} OFF`;
  }

  const minAmt = coupon.conditions?.minSubtotal ?? coupon.minPurchaseAmount ?? 0;
  let conditionText = "";
  if (minAmt > 0) {
    conditionText = `Min. purchase ₹${minAmt}`;
  } else {
    conditionText = "No minimum purchase";
  }

  return {
    code: coupon.code,
    offerTitle,
    conditionText,
    message: coupon.message || "",
    offerType: coupon.offerType,
    minPurchaseAmount: minAmt,
    maxDiscountAmount: coupon.maxDiscountAmount || 0,
    applicabilityType: coupon.applicabilityType || "ALL_PRODUCTS",
  };
};

export const getApplicableCouponsForProduct = (coupons, product) => {
  if (!Array.isArray(coupons) || !product) return [];
  return coupons
    .map((c) => getProductCouponOffer(c, product))
    .filter(Boolean);
};
