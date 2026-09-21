const { CouponModel } = require("../../models/coupons.model");
const { User } = require("../../models/users.model");
const { getCart } = require("./Cart/cart.service");
const ApiError = require("../../utils/apiError");
const { Product } = require("../../models/Product.model");
const { findProductVariant } = require("../../utils/productVariant");

// ============================================================
// IMAGE HELPER
// ============================================================
const normalizeImages = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter(
    (image) =>
      typeof image === "string" &&
      image.trim() !== ""
  );
};

// ============================================================
// GET PRODUCT IMAGES
// ============================================================
const resolveProductImages = (
  product,
  selectedVariant = null
) => {
  // ----------------------------------------------------------
  // 1. Variant image
  // ----------------------------------------------------------
  const variantImages =
    normalizeImages(
      selectedVariant?.variantImages
    );

  if (variantImages.length > 0) {
    return variantImages;
  }

  // ----------------------------------------------------------
  // 2. Non-variant image
  // ----------------------------------------------------------
  const nonVariantImages =
    normalizeImages(
      product?.nonVariant?.nonVariantImages
    );

  if (
    product?.productType === "nonVariant" &&
    nonVariantImages.length > 0
  ) {
    return nonVariantImages;
  }

  // ----------------------------------------------------------
  // 3. Main product image
  // ----------------------------------------------------------
  const productImages =
    normalizeImages(
      product?.productImages
    );

  if (productImages.length > 0) {
    return productImages;
  }

  // ----------------------------------------------------------
  // 4. Empty fallback
  // ----------------------------------------------------------
  return [];
};

// ============================================================
// MAIN CHECKOUT SERVICE
// ============================================================
const checkOut = async (req) => {
  const userId =
    req.user?._id;

  if (!userId) {
    throw new ApiError(
      400,
      "User must login"
    );
  }

  // ==========================================================
  // USER ADDRESS
  // ==========================================================
  const userAddress =
    await User.findById(userId)
      .select(
        "name email phone address"
      )
      .lean();

  if (!userAddress) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  // ==========================================================
  // CART
  // ==========================================================
  const cartData =
    await getCart(req);

  if (
    !cartData?.items?.length
  ) {
    throw new ApiError(
      400,
      "Cart is empty"
    );
  }

  // ==========================================================
  // CHECK DISCOUNT
  // ==========================================================
  const doesHaveDiscount =
    cartData.items.some(
      (item) =>
        Number(
          item.priceBreakdown
            ?.discountPercentage || 0
        ) > 0
    );

  // ==========================================================
  // COUPONS
  // ==========================================================
  let CouponData = [];

  if (!doesHaveDiscount) {
    const currentDate =
      new Date();

    const rawCoupons =
      await CouponModel.find({
        status: "active",

        validFrom: {
          $lte: currentDate,
        },

        validUntil: {
          $gte: currentDate,
        },
      })
        .select(
          "code message offerType discountType discountValue maxDiscountAmount minPurchaseAmount freeProduct validFrom validUntil couponImage"
        )
        .lean();

    // ========================================================
    // ENRICH COUPONS
    // ========================================================
    CouponData =
      await Promise.all(
        rawCoupons.map(
          async (coupon) => {
            if (
              coupon.offerType ===
                "FREE_PRODUCT" &&
              coupon.freeProduct
                ?.productId
            ) {
              try {
                const product =
                  await Product.findById(
                    coupon.freeProduct
                      .productId
                  ).lean();

                if (product) {
                  let freeProductDetails =
                    {
                      productId:
                        product._id,

                      productName:
                        product.productName,

                      productType:
                        coupon.freeProduct
                          .productType,

                      productImage:
                        null,

                      productImages:
                        [],

                      variantDetails:
                        null,

                      price: 0,
                    };

                  // ==================================================
                  // FREE VARIANT PRODUCT
                  // ==================================================
                  if (
                    coupon.freeProduct
                      .productType ===
                      "variant" &&
                    coupon.freeProduct
                      .variantId
                  ) {
                    const selectedVariant =
                      findProductVariant(
                        product,
                        coupon.freeProduct
                          .variantId
                      );

                    if (
                      selectedVariant
                    ) {
                      freeProductDetails.variantDetails =
                        {
                          unit:
                            selectedVariant.unit,

                          displayName:
                            selectedVariant.unit,
                        };
                    }

                    const resolvedImages =
                      resolveProductImages(
                        product,
                        selectedVariant
                      );

                    freeProductDetails.productImages =
                      resolvedImages;

                    freeProductDetails.productImage =
                      resolvedImages[0] ||
                      null;

                    freeProductDetails.price =
                      Number(
                        selectedVariant
                          ?.price
                          ?.salePrice ||
                          0
                      );
                  }

                  // ==================================================
                  // FREE NON-VARIANT PRODUCT
                  // ==================================================
                  else if (
                    coupon.freeProduct
                      .productType ===
                    "nonVariant"
                  ) {
                    const resolvedImages =
                      resolveProductImages(
                        product,
                        null
                      );

                    freeProductDetails.productImages =
                      resolvedImages;

                    freeProductDetails.productImage =
                      resolvedImages[0] ||
                      null;

                    freeProductDetails.price =
                      Number(
                        product
                          .nonVariant
                          ?.price
                          ?.salePrice ||
                          0
                      );
                  }

                  return {
                    ...coupon,
                    freeProductDetails,
                  };
                }
              } catch (error) {
                console.error(
                  "Error fetching free product details:",
                  error
                );
              }
            }

            return coupon;
          }
        )
      );
  }

  // ==========================================================
  // TOTALS
  // ==========================================================
  let totalCostPrice = 0;
  let totalSalePrice = 0;
  let totalSavings = 0;

  // ==========================================================
  // ENRICH CART ITEMS
  // ==========================================================
  const enrichedCartItems =
    await Promise.all(
      cartData.items.map(
        async (item) => {
          // --------------------------------------------------
          // PRODUCT
          // --------------------------------------------------
          const product =
            await Product.findById(
              item.productId
            ).lean();

          if (!product) {
            throw new ApiError(
              404,
              `Product not found for ID: ${item.productId}`
            );
          }

          let priceInfo = {};
          let productImages = [];
          let variantDetails = {};
          let selectedVariant = null;

          // ==================================================
          // NON VARIANT
          // ==================================================
          if (
            product.productType ===
            "nonVariant"
          ) {
            const nonVariant =
              product.nonVariant ||
              {};

            priceInfo =
              nonVariant.price ||
              {};

            productImages =
              resolveProductImages(
                product,
                null
              );
          }

          // ==================================================
          // VARIANT
          // ==================================================
          else if (
            product.productType ===
            "variant"
          ) {
            selectedVariant =
              findProductVariant(
                product,
                item.variantId
              );

            if (
              !selectedVariant
            ) {
              throw new ApiError(
                404,
                `Variant not found for product ${product.productName}`
              );
            }

            variantDetails = {
              unit:
                selectedVariant.unit ||
                null,
            };

            priceInfo =
              selectedVariant.price ||
              {};

            // IMPORTANT:
            // Variant image -> Main product image fallback
            productImages =
              resolveProductImages(
                product,
                selectedVariant
              );
          }

          // ==================================================
          // FINAL CART IMAGE FALLBACK
          // ==================================================
          // If Product lookup somehow has no image,
          // use image already resolved by getCart().
          if (
            productImages.length ===
              0 &&
            Array.isArray(
              item.productImages
            ) &&
            item.productImages
              .length > 0
          ) {
            productImages =
              normalizeImages(
                item.productImages
              );
          }

          // ==================================================
          // QUANTITY
          // ==================================================
          const quantity =
            Number(
              item.quantity || 1
            );

          // ==================================================
          // PRICE
          // ==================================================
          const costPrice =
            Number(
              priceInfo.costPrice ||
                0
            );

          const salePrice =
            Number(
              priceInfo.salePrice ||
                0
            );

          const discount =
            Number(
              priceInfo.discount ||
                0
            );

          const taxPercentage =
            Number(
              priceInfo.tax ||
                0
            );

          // ==================================================
          // TAX
          // ==================================================
          const taxAmount =
            salePrice > 0 &&
            taxPercentage > 0
              ? Number(
                  (
                    salePrice -
                    salePrice /
                      (1 +
                        taxPercentage /
                          100)
                  ).toFixed(2)
                )
              : 0;

          // ==================================================
          // SUBTOTAL
          // ==================================================
          const subtotal =
            salePrice *
            quantity;

          // ==================================================
          // SAVINGS
          // ==================================================
          const savings =
            Math.max(
              costPrice -
                salePrice,
              0
            ) * quantity;

          // ==================================================
          // TOTALS
          // ==================================================
          totalCostPrice +=
            costPrice *
            quantity;

          totalSalePrice +=
            salePrice *
            quantity;

          totalSavings +=
            savings;

          // ==================================================
          // LOG IMAGE FOR DEBUGGING
          // ==================================================
          console.log(
            "CHECKOUT PRODUCT:",
            product.productName
          );

          console.log(
            "CHECKOUT PRODUCT TYPE:",
            product.productType
          );

          console.log(
            "CHECKOUT VARIANT ID:",
            item.variantId
          );

          console.log(
            "CHECKOUT PRODUCT IMAGES:",
            product.productImages
          );

          console.log(
            "CHECKOUT VARIANT IMAGES:",
            selectedVariant
              ?.variantImages
          );

          console.log(
            "CHECKOUT FINAL IMAGES:",
            productImages
          );

          // ==================================================
          // RETURN CART ITEM
          // ==================================================
          return {
            productId:
              product._id,

            variantId:
              item.variantId ||
              null,

            productName:
              product.productName,

            productTitle:
              product.productTitle ||
              product.productName,

            productCategory:
              product.productCategory,

            quantity,

            productType:
              product.productType,

            variantDetails,

            // =================================================
            // IMPORTANT IMAGE RESPONSE
            // =================================================
            productImages,

            // Backward compatibility
            productImage:
              productImages[0] ||
              null,

            // Selected unit
            selectedUnit:
              selectedVariant?.unit ||
              null,

            priceBreakdown: {
              costPrice,

              salePrice,

              taxPercentage,

              taxAmount,

              discount,

              subtotal,

              savings,
            },

            subtotal,
          };
        }
      )
    );

  // ==========================================================
  // SHIPPING
  // ==========================================================
  let shippingCharge = 50;

  if (
    totalSalePrice >=
    999
  ) {
    shippingCharge = 0;
  }

  // ==========================================================
  // FINAL TOTAL
  // ==========================================================
  const finalTotal =
    totalSalePrice +
    shippingCharge;

  // ==========================================================
  // FINAL DEBUG
  // ==========================================================
  console.log(
    "========== CHECKOUT FINAL RESPONSE =========="
  );

  console.log(
    enrichedCartItems.map(
      (item) => ({
        productId:
          item.productId,

        productName:
          item.productName,

        productImages:
          item.productImages,

        productImage:
          item.productImage,
      })
    )
  );

  console.log(
    "=============================================="
  );

  // ==========================================================
  // FINAL RESPONSE
  // ==========================================================
  return {
    success: true,

    message:
      "Checkout data fetched successfully",

    data: {
      userAddress,

      cartItems:
        enrichedCartItems,

      totalPrice:
        finalTotal,

      pricing: {
        subtotal:
          totalSalePrice,

        shipping:
          shippingCharge,

        total:
          finalTotal,

        savings:
          totalSavings,
      },

      totalCostPrice,

      totalSalePrice,

      totalSavings,

      CouponData,
    },
  };
};

// ============================================================
// EXPORT
// ============================================================
module.exports = {
  checkOut,
};