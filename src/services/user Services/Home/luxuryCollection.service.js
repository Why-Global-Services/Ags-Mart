const httpStatus = require("http-status");
const { Product } = require("../../../models/Product.model");
const { orderDetailsModel } = require("../../../models/orders.model");
const ApiError = require("../../../utils/apiError");
const { cart } = require("../../../models/cart.model");
const { wishlistSchema } = require("../../../models/wishlist.model");

const getLuxuryCollectionProducts = async (req, res) => {
  const userId = req.user?._id;

  // 🧲 Fetch products priced above 1000 (any variant or nonVariant)
  const luxuryCollectionProducts = await Product.find({
    $or: [
      { "nonVariant.price.salePrice": { $gt: 1000 } },
      { "variant.colorOnlyVariants.price.salePrice": { $gt: 1000 } },
      { "variant.sizeColorVariants.price.salePrice": { $gt: 1000 } },
      { "variant.sizeOnlyVariants.price.salePrice": { $gt: 1000 } },
    ],
    status: "active",
  }).limit(4);

  if (luxuryCollectionProducts.length === 0) {
    return {
      success: true,
      message: `No products found`,
      data: [],
    };
  }

  // 🧺 Fetch cart & wishlist item IDs
  let cartItems = [];
  let wishlistItems = [];

  if (userId) {
    const userCart = await cart.findOne({ userId });
    if (userCart && Array.isArray(userCart.items)) {
      cartItems = userCart.items.map((i) => ({
        productId: i.productId?.toString(),
        variantId: i.variantId?.toString(),
      }));
    }

    const userWishlist = await wishlistSchema.findOne({ userId });
    if (userWishlist && Array.isArray(userWishlist.items)) {
      wishlistItems = userWishlist.items.map((i) => ({
        productId: i.productId?.toString(),
        variantId: i.variantId?.toString(),
      }));
    }
  }

  // 🧩 Map over products and inject variant-level flags
  const productsWithFlags = luxuryCollectionProducts.map((product) => {
    const productIdStr = product._id?.toString();

    const isInCart = cartItems.some((item) => item.productId === productIdStr);
    const isInWishlist = wishlistItems.some(
      (item) => item.productId === productIdStr
    );

    let updatedVariant = product.variant;

    // ✅ Inject flags inside variants (if any)
    if (product.productType === "variant" && updatedVariant) {
      const variantType = updatedVariant.variantType;

      if (variantType === "sizeColor") {
        updatedVariant.sizeColorVariants = updatedVariant.sizeColorVariants.map(
          (variant) => {
            const variantId = variant._id?.toString();
            const variantInCart = cartItems.some(
              (item) =>
                item.productId === productIdStr &&
                item.variantId === variantId
            );
            const variantInWishlist = wishlistItems.some(
              (item) =>
                item.productId === productIdStr &&
                item.variantId === variantId
            );

            return {
              ...variant,
              isInCart: variantInCart,
              isInWishlist: variantInWishlist,
            };
          }
        );
        
      } else if (variantType === "colorOnly") {
        updatedVariant.colorOnlyVariants = updatedVariant.colorOnlyVariants.map(
          (variant) => {
            const variantId = variant._id?.toString();
            const variantInCart = cartItems.some(
              (item) =>
                item.productId === productIdStr &&
                item.variantId === variantId
            );
            const variantInWishlist = wishlistItems.some(
              (item) =>
                item.productId === productIdStr &&
                item.variantId === variantId
            );

            return {
              ...variant,
              isInCart: variantInCart,
              isInWishlist: variantInWishlist,
            };
          }
        );
      } else if (variantType === "sizeOnly") {
        updatedVariant.sizeOnlyVariants = updatedVariant.sizeOnlyVariants.map(
          (variant) => {
            const variantId = variant._id?.toString();
            const variantInCart = cartItems.some(
              (item) =>
                item.productId === productIdStr &&
                item.variantId === variantId
            );
            const variantInWishlist = wishlistItems.some(
              (item) =>
                item.productId === productIdStr &&
                item.variantId === variantId
            );

            return {
              ...variant,
              isInCart: variantInCart,
              isInWishlist: variantInWishlist,
            };
          }
        );
      }
    }

    // ✅ Add product-level flags + updated variants
    return {
      ...product.toObject(),
      isInCart,
      isInWishlist,
      variant: updatedVariant,
    };
  });

  return {
    success: true,
    message: "Luxury collection products fetched successfully",
    data: productsWithFlags,
  };
};



module.exports = {
  getLuxuryCollectionProducts,
};

