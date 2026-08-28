const { cart } = require("../../models/cart.model");
const { Product } = require("../../models/Product.model");
const { reviewsRatings } = require("../../models/reviewRating.model");
const { wishlistSchema } = require("../../models/wishlist.model");
const ApiError = require("../../utils/apiError");

const ProductDetials = async (req) => {
  const { _id } = req.params;
  const userId = req?.user?._id || null;

  console.log("Requested product ID:", _id);
  console.log("User ID:", userId);

  const product = await Product.findOne({
    _id,
    status: "active",
  }).lean();

  if (!product) {
    return { success: false, message: "Product not found", data: null };
  }

  const allProductIds = [product._id];

  // Collect related product IDs for wishlist/cart comparison
  if (product.linkProducts?.relatedProducts?.length)
    allProductIds.push(...product.linkProducts.relatedProducts);

  let recommendedProducts = [];
  if (product.productCategory) {
    recommendedProducts = await Product.find({
      productCategory: product.productCategory,
      _id: { $ne: product._id },
      status: "active",
    })
      .select("-shipping")
      .limit(8)
      .lean();

    allProductIds.push(...recommendedProducts.map((p) => p._id));
  }

  // 🟢 Fetch wishlist & cart for logged-in users
  let wishlistItems = [];
  let cartItems = [];

  if (userId) {
    const [wishlistEntries, cartEntries] = await Promise.all([
      wishlistSchema.find({ userId }).lean(),
      cart.find({ userId }).lean(),
    ]);

    wishlistItems = wishlistEntries.flatMap((w) => w.items || []);
    cartItems = cartEntries.flatMap((c) => c.items || []);
  }

  // Helper to check if product/variant is in wishlist/cart
  const checkFlags = (productId, variantId = null) => {
    const isWishlist = wishlistItems.some(
      (item) =>
        String(item.productId) === String(productId) &&
        String(item.variantId || "") === String(variantId || "")
    );
    const isInCart = cartItems.some(
      (item) =>
        String(item.productId) === String(productId) &&
        String(item.variantId || "") === String(variantId || "")
    );
    return { isWishlist, isInCart };
  };

  // 🟢 Base product
  Object.assign(product, checkFlags(product._id));

  // 🟢 Variants (if exist)
  if (Array.isArray(product.variant) && product.variant.length) {
    product.variant = product.variant.map((v) => ({
      ...v,
      ...checkFlags(product._id, v._id),
    }));
  }

  // 🟢 Non-variants (object or array)
  if (product.nonVariant) {
    if (Array.isArray(product.nonVariant)) {
      product.nonVariant = product.nonVariant.map((nv) => ({
        ...nv,
        ...checkFlags(product._id, nv._id),
      }));
    } else {
      // If nonVarient is a single object
      product.nonVariant = {
        ...product.nonVariant,
        ...checkFlags(product._id, product.nonVariant._id),
      };
    }
  }

  // 🟢 Cross-sell products
  if (product.linkProducts?.relatedProducts?.length) {
    const relatedProducts = await Product.find({
      _id: { $in: product.linkProducts.relatedProducts },
      status: "active",
    }).lean();

    product.relatedProducts = relatedProducts.map((cp) => ({
      ...cp,
      ...checkFlags(cp._id),
    }));
  }

  // 🟢 Recommended products
  product.recommendedProducts = recommendedProducts.map((rp) => ({
    ...rp,
    ...checkFlags(rp._id),
  }));

  // Reviews (unchanged)
  const reviews = await reviewsRatings.aggregate([
    { $match: { productId: product._id } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        review: 1,
        rating: 1,
        userName: "$user.name",
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  product.productReviews = reviews;
  product.averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

  return {
    success: true,
    message: "Product found successfully",
    data: product,
  };
};


const getAllProducts = async (req) => {
  const { _id } = req.params;
  const findProducts = await Product.aggregate([
    {
      $match: {
        status: "active",
        category_id: _id,
      },
    },
  ]);

  return {
    success: true,
    message: "Category Based Product get successfully",
    data: findProducts,
  };
};

const getSubCategoryBasedProducts = async (req) => {
  const { _id } = req.params;
  const findProducts = await Product.aggregate([
    {
      $match: {
        status: "active",
        subcategory_id: _id,
      },
    },
  ]);

  return {
    success: true,
    message: "Sub-Category Based Products get successfully",
    data: findProducts,
  };
};

module.exports = {
  ProductDetials,
  getAllProducts,
  getSubCategoryBasedProducts,
};
