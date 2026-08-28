const httpStatus = require("http-status");
const { Product } = require("../../../models/Product.model");
const { cart } = require("../../../models/cart.model");
const { wishlistSchema } = require("../../../models/wishlist.model");
const ApiError = require("../../../utils/apiError");

const Search = async (req) => {
  const userId = req.user?._id;
  const { query, category, minPrice, maxPrice, discount, minRating } = req.query;

  // 🔍 Build search filter
  let searchFilter = { status: "active" };

  if (query && query.toLowerCase().includes("new")) {
    const newArrivals = await Product.find({ status: "active" })
  .sort({ createdAt: -1 }) // Sort by newest first
  .limit(20);              // Limit to 20 products

  return {
    success: true,
    message: "Products searched successfully",
    count:newArrivals.length,
    data: newArrivals,
  };
  }

  if (query && query.toLowerCase() === "all") {
  const allProducts = await Product.find({ status: "active" })
    .limit(50)
    .sort({ createdAt: -1 });

  return {
    success: true,
    message: "All products fetched successfully",
    count: allProducts.length,
    data: allProducts,
  };
}

  // Text search across multiple fields
  if (query) {
    searchFilter.$or = [
      { productName: { $regex: query, $options: "i" } },
      { productTitle: { $regex: query, $options: "i" } },
      { productCategory: { $regex: query, $options: "i" } },
      { productSubCategory: { $regex: query, $options: "i" } },
      { "otherAttributes.brand": { $regex: query, $options: "i" } },
      { "otherAttributes.pattern": { $regex: query, $options: "i" } },
      { "otherAttributes.occasion": { $regex: query, $options: "i" } },

      { "variant.sizeOnlyVariants.color": { $regex: query, $options: "i" } },
      { "variant.sizeOnlyVariants.size": { $regex: query, $options: "i" } },
      { "variant.sizeOnlyVariants.productCode": { $regex: query, $options: "i" } },

      { "variant.colorOnlyVariants.color": { $regex: query, $options: "i" } },
      { "variant.colorOnlyVariants.size": { $regex: query, $options: "i" } },
      { "variant.colorOnlyVariants.productCode": { $regex: query, $options: "i" } },

      { "variant.sizeColorVariants.color": { $regex: query, $options: "i" } },
      { "variant.sizeColorVariants.size": { $regex: query, $options: "i" } },
      { "variant.sizeColorVariants.productCode": { $regex: query, $options: "i" } },

      { "inventory.productCode": { $regex: query, $options: "i" } },
      { searchTags: { $regex: query, $options: "i" } },
      { productDescription: { $regex: query, $options: "i" } },
    ];
  }

  // Category filter
  if (category) {
    searchFilter.$and = searchFilter.$and || [];
    searchFilter.$and.push({
      $or: [
        { productCategory: { $regex: category, $options: "i" } },
        { productSubCategory: { $regex: category, $options: "i" } },
        { category_id: { $regex: category, $options: "i" } },
        { subcategory_id: { $regex: category, $options: "i" } },
      ],
    });
  }

  // Price range filter
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);

    searchFilter.$or = searchFilter.$or || [];
    searchFilter.$or.push(
      { "nonVariant.price.salePrice": priceFilter },
      { "variant.colorOnlyVariants.price.salePrice": priceFilter },
      { "variant.sizeOnlyVariants.price.salePrice": priceFilter },
      { "variant.sizeColorVariants.price.salePrice": priceFilter }
    );
  }

  // Discount filter
if (discount) {
  searchFilter.$or = searchFilter.$or || [];

  if (discount === "all") {
    // All products with any discount > 0
    searchFilter.$or.push(
      { "nonVariant.price.discount": { $gt: 0 } },
      { "variant.colorOnlyVariants.price.discount": { $gt: 0 } },
      { "variant.sizeOnlyVariants.price.discount": { $gt: 0 } },
      { "variant.sizeColorVariants.price.discount": { $gt: 0 } }
    );
  } else {
    // Only products with discount >= given value
    const discountValue = parseFloat(discount);
    searchFilter.$or.push(
      { "nonVariant.price.discount": { $gte: discountValue } },
      { "variant.colorOnlyVariants.price.discount": { $gte: discountValue } },
      { "variant.sizeOnlyVariants.price.discount": { $gte: discountValue } },
      { "variant.sizeColorVariants.price.discount": { $gte: discountValue } }
    );
  }
}

// Rating filter
// Rating filter
if (minRating) {
  const minRatingValue = parseFloat(minRating);
  if (!isNaN(minRatingValue)) {
    searchFilter.$and = searchFilter.$and || [];
    searchFilter.$and.push({
      averageRating: { $gte: minRatingValue }
    });
  }
}


  // 🧩 Fetch products
  const products = await Product.find(searchFilter).limit(50);

  // 🧺 Fetch user's cart & wishlist items (only once)
  let cartItems = [];
  let wishlistItems = [];

  if (userId) {
    const userCart = await cart.findOne({ userId });
    if (userCart?.items?.length) {
      cartItems = userCart.items.map((i) => ({
        productId: i.productId?.toString(),
        variantId: i.variantId?.toString(),
      }));
    }

    const userWishlist = await wishlistSchema.findOne({ userId });
    if (userWishlist?.items?.length) {
      wishlistItems = userWishlist.items.map((i) => ({
        productId: i.productId?.toString(),
        variantId: i.variantId?.toString(),
      }));
    }
  }

  // ⚡ Map product-level & variant-level flags
  const productsWithFlags = products.map((product) => {
    const productIdStr = product._id?.toString();
    const isInCart = cartItems.some((item) => item.productId === productIdStr);
    const isInWishlist = wishlistItems.some(
      (item) => item.productId === productIdStr
    );

    let updatedVariant = product.variant;

    if (product.productType === "variant" && updatedVariant) {
      const variantType = updatedVariant.variantType;

      const addFlags = (variantsArray = []) =>
        variantsArray.map((variant) => {
          const variantId = variant._id?.toString();
          return {
            ...variant,
            isInCart: cartItems.some(
              (i) =>
                i.productId === productIdStr && i.variantId === variantId
            ),
            isInWishlist: wishlistItems.some(
              (i) =>
                i.productId === productIdStr && i.variantId === variantId
            ),
          };
        });

      if (variantType === "colorOnly") {
        updatedVariant.colorOnlyVariants = addFlags(
          updatedVariant.colorOnlyVariants
        );
      } else if (variantType === "sizeOnly") {
        updatedVariant.sizeOnlyVariants = addFlags(
          updatedVariant.sizeOnlyVariants
        );
      } else if (variantType === "sizeColor") {
        updatedVariant.sizeColorVariants = addFlags(
          updatedVariant.sizeColorVariants
        );
      }
    }

    return {
      ...product.toObject(),
      isInCart,
      isInWishlist,
      variant: updatedVariant,
    };
  });

  // ✅ Return
  return {
    success: true,
    message: "Products searched successfully",
    count: productsWithFlags.length,
    data: productsWithFlags,
  };
};

module.exports = {
  Search,
};
