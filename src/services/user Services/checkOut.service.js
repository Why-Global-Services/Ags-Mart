const { CouponModel } = require("../../models/coupons.model");
const { User } = require("../../models/users.model");
const { getCart } = require("./Cart/cart.service");
const ApiError = require("../../utils/apiError");
const { Product } = require("../../models/Product.model");

// Main Checkout Service
const checkOut = async (req) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "User must login");

  // 🏠 Fetch user address
  const userAddress = await User.findById(userId)
    .select("name email phone address")
    .lean();
  if (!userAddress) throw new ApiError(404, "User not found");

  // 🛒 Get cart data
  const cartData = await getCart(req);
  if (!cartData?.items?.length) {
    throw new ApiError(400, "Cart is empty");
  }
  

  const doesHaveDiscount = cartData.items.some((item => {return item.priceBreakdown?.discountPercentage > 0}));
  
  // if (doesHaveDiscount) {
  //   throw new ApiError(400, "Please clear discounted items from cart before checkout");
  // }

  let CouponData = []

  // 📅 Fetch active coupons with populated product details
  if(!doesHaveDiscount){
  const currentDate = new Date();
  const rawCoupons = await CouponModel.find({
    status: "active",
    validFrom: { $lte: currentDate },
    validUntil: { $gte: currentDate },
  })
    .select("code message offerType discountType discountValue maxDiscountAmount minPurchaseAmount freeProduct validFrom validUntil couponImage")
    .lean();

  // 🎁 Enrich coupons with free product details
   CouponData = await Promise.all(
    rawCoupons.map(async (coupon) => {
      if (coupon.offerType === "FREE_PRODUCT" && coupon.freeProduct?.productId) {
        try {
          const product = await Product.findById(coupon.freeProduct.productId).lean();
          
          if (product) {
            let freeProductDetails = {
              productId: product._id,
              productName: product.productName,
              productType: coupon.freeProduct.productType,
              productImage: null,
              variantDetails: null,
              price: 0,
            };

            // Get variant-specific details
            if (coupon.freeProduct.productType === "variant" && coupon.freeProduct.variantId) {
              const variant = product.variant;
              let selectedVariant = null;

              if (variant?.variantType === "sizeColor") {
                selectedVariant = variant.sizeColorVariants?.find(
                  (v) => v._id === coupon.freeProduct.variantId
                );
                if (selectedVariant) {
                  freeProductDetails.variantDetails = {
                    size: selectedVariant.size,
                    color: selectedVariant.color,
                    displayName: `${selectedVariant.size} - ${selectedVariant.color}`,
                  };
                }
              } else if (variant?.variantType === "colorOnly") {
                selectedVariant = variant.colorOnlyVariants?.find(
                  (v) => v._id === coupon.freeProduct.variantId
                );
                if (selectedVariant) {
                  freeProductDetails.variantDetails = {
                    color: selectedVariant.color,
                    displayName: selectedVariant.color,
                  };
                }
              } else if (variant?.variantType === "sizeOnly") {
                selectedVariant = variant.sizeOnlyVariants?.find(
                  (v) => v._id === coupon.freeProduct.variantId
                );
                if (selectedVariant) {
                  freeProductDetails.variantDetails = {
                    size: selectedVariant.size,
                    displayName: selectedVariant.size,
                  };
                }
              }

              // Get variant image or fallback to product images
              if (selectedVariant?.variantImages?.length) {
                freeProductDetails.productImage = selectedVariant.variantImages[0];
              } else if (product.productImages?.length) {
                freeProductDetails.productImage = product.productImages[0];
              }

              freeProductDetails.price = selectedVariant?.price?.salePrice || 0;
            } else if (coupon.freeProduct.productType === "nonVariant") {
              // Non-variant product
              if (product.nonVariant?.nonVariantImages?.length) {
                freeProductDetails.productImage = product.nonVariant.nonVariantImages[0];
              } else if (product.productImages?.length) {
                freeProductDetails.productImage = product.productImages[0];
              }

              freeProductDetails.price = product.nonVariant?.price?.salePrice || 0;
            }

            return {
              ...coupon,
              freeProductDetails, // Add enriched product details
            };
          }
        } catch (err) {
          console.error("Error fetching free product details:", err);
        }
      }
      
      return coupon;
    })
  );
  }


  // 🧮 Initialize totals
  let totalCostPrice = 0;
  let totalSalePrice = 0;
  let totalSavings = 0;

  // 🧾 Enrich cart items
  const enrichedCartItems = await Promise.all(
    cartData.items.map(async (item) => {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        throw new ApiError(404, `Product not found for ID: ${item.productId}`);
      }

      let priceInfo = {};
      let productImages = [];
      let variantDetails = {};

      if (product.productType === "nonVariant") {
        const nonVariant = product.nonVariant || {};
        priceInfo = nonVariant.price || {};
        if (nonVariant.nonVariantImages) {
          productImages = Array.isArray(nonVariant.nonVariantImages)
            ? nonVariant.nonVariantImages
            : [nonVariant.nonVariantImages];
        }
      } else if (product.productType === "variant") {
        const variant = product.variant || {};
        let selectedVariant = null;

        if (variant.variantType === "sizeColor") {
          selectedVariant = variant.sizeColorVariants?.find(
            (v) => v._id.toString() === item.variantId
          );

          if (selectedVariant) {
            variantDetails = {
              size: selectedVariant.size,
              color: selectedVariant.color,
            };
          }
        } else if (variant.variantType === "colorOnly") {
          selectedVariant = variant.colorOnlyVariants?.find(
            (v) => v._id.toString() === item.variantId
          );

          if (selectedVariant) {
            variantDetails = {
              color: selectedVariant.color,
            };
          }
        } else if (variant.variantType === "sizeOnly") {
          selectedVariant = variant.sizeOnlyVariants?.find(
            (v) => v._id.toString() === item.variantId
          );

          if (selectedVariant) {
            variantDetails = {
              size: selectedVariant.size,
            };
          }
        }

        if (!selectedVariant) {
          throw new ApiError(
            404,
            `Variant not found for product ${product.productName}`
          );
        }

        priceInfo = selectedVariant.price || {};
        if (selectedVariant.variantImages) {
          productImages = Array.isArray(selectedVariant.variantImages)
            ? selectedVariant.variantImages
            : [selectedVariant.variantImages];
        }
      }

      const quantity = item.quantity || 1;
      const costPrice = priceInfo.costPrice || 0;
      const salePrice = priceInfo.salePrice || 0;
      const discount = priceInfo.discount || 0;
      const taxPercentage = priceInfo.tax || 0;

      const taxAmount =
        salePrice > 0 && taxPercentage > 0
          ? Number(
              (
                salePrice -
                salePrice / (1 + taxPercentage / 100)
              ).toFixed(2)
            )
          : 0;

      const subtotal = salePrice * quantity;
      const savings = (costPrice - salePrice) * quantity || 0;

      totalCostPrice += costPrice * quantity;
      totalSalePrice += salePrice * quantity;
      totalSavings += savings;

      return {
        productId: product._id,
        productName: product.productName,
        productCategory: product.productCategory,
        quantity,
        productType: product.productType,
        variantDetails,
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
        productImages,
      };
    })
  );

  // 🚚 Shipping charge calculation
  let shippingCharge = 50;
  if (totalSalePrice >= 999) {
    shippingCharge = 0;
  }

  const finalTotal = totalSalePrice + shippingCharge;

  // ✅ Final Response
  return {
    success: true,
    message: "Checkout data fetched successfully",
    data: {
      userAddress,
      cartItems: enrichedCartItems,
      totalPrice: finalTotal,
      pricing: {
        subtotal: totalSalePrice,
        shipping: shippingCharge,
        total: finalTotal,
        savings: totalSavings,
      },
      totalCostPrice,
      totalSalePrice,
      totalSavings,
      CouponData, // Now includes freeProductDetails
    },
  };
};

module.exports = { checkOut };