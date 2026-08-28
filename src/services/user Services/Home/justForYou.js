const httpStatus = require("http-status");
const { Product } = require("../../../models/Product.model");
const { cart } = require("../../../models/cart.model");
const { wishlistSchema } = require("../../../models/wishlist.model");
const ApiError = require("../../../utils/apiError");

const getJustForYouProduct = async (req, res) => {
  const userId = req.user?._id;

  // 🧩 Fetch 1 random active product
  const justForYouProduct = await Product.aggregate([
    { $match: { status: "active" } },
    { $sample: { size: 1 } },
  ]);

  if (justForYouProduct.length === 0) {
    return {
      success: true,
      message: "No products found",
      data: [],
    };
  }

  // 🧺 Fetch user's cart & wishlist items
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

  // 🧠 Add flags (isInCart & isInWishlist)
  const productsWithFlags = justForYouProduct.map((product) => {
    const productIdStr = product._id?.toString();

    // Base product-level flags
    const isInCart = cartItems.some((item) => item.productId === productIdStr);
    const isInWishlist = wishlistItems.some(
      (item) => item.productId === productIdStr
    );

    let updatedVariant = product.variant;

    if (product.productType === "variant" && updatedVariant) {
      const variantType = updatedVariant.variantType;

      const addFlagsToVariant = (variantsArray) =>
        variantsArray.map((variant) => {
          const variantId = variant._id?.toString();
          const variantInCart = cartItems.some(
            (item) =>
              item.productId === productIdStr && item.variantId === variantId
          );
          const variantInWishlist = wishlistItems.some(
            (item) =>
              item.productId === productIdStr && item.variantId === variantId
          );

          return {
            ...variant,
            isInCart: variantInCart,
            isInWishlist: variantInWishlist,
          };
        });

      if (variantType === "sizeColor") {
        updatedVariant.sizeColorVariants = addFlagsToVariant(
          updatedVariant.sizeColorVariants || []
        );
      } else if (variantType === "colorOnly") {
        updatedVariant.colorOnlyVariants = addFlagsToVariant(
          updatedVariant.colorOnlyVariants || []
        );
      } else if (variantType === "sizeOnly") {
        updatedVariant.sizeOnlyVariants = addFlagsToVariant(
          updatedVariant.sizeOnlyVariants || []
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

  // ✅ Return
  return {
    success: true,
    message: "Just for you product fetched successfully",
    data: productsWithFlags,
  };
};

module.exports = {
  getJustForYouProduct,
};
