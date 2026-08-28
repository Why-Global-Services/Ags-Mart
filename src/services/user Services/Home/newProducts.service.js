
const { cart } = require("../../../models/cart.model");
const { Product } = require("../../../models/Product.model");
const { wishlistSchema } = require("../../../models/wishlist.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");

const getNewProducts = async (req, res) => {
  const userId = req.user?._id;

  const newProducts = await Product.aggregate([
    { $match: { status: "active" } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
  ]);

  if (newProducts.length === 0) {
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

  // 🧩 Now map over products
  const productsWithFlags = newProducts.map((product) => {
    const productIdStr = product._id?.toString();

    // Base product flags (if any variant is in cart/wishlist)
    const isInCart = cartItems.some((item) => item.productId === productIdStr);
    const isInWishlist = wishlistItems.some(
      (item) => item.productId === productIdStr
    );

    let updatedVariant = product.variant;

    if (product.productType === "variant" && updatedVariant) {
      const variantType = updatedVariant.variantType;

      // Apply flags inside each variant type
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

    return {
      ...product,
      isInCart,
      isInWishlist,
      variant: updatedVariant,
    };
  });

  return {
    success: true,
    message: "New products fetched successfully (latest 10)",
    data: productsWithFlags,
  };
};



module.exports = {
  getNewProducts,
};
