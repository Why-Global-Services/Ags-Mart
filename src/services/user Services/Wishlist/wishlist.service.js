const { Product } = require("../../../models/Product.model");
const { wishlistSchema } = require("../../../models/wishlist.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");

const addWishlist = async (req) => {
  const { productId, variantId } = req.query;

  const userId = req.user?._id || null;
  const guestId = req.headers.guestid || req.headers["guest-id"] || null;

  console.log("GUEST ID:", guestId);

  // ❗ At least one must exist
  if (!userId && !guestId) {
    throw new ApiError(400, "User or Guest ID required");
  }

  // 🟢 Decide cart owner
  const cartQuery = userId ? { userId } : { guestId };

  if (!productId)
    throw new ApiError(httpStatus.BAD_REQUEST, "Product ID is required");

  const findProduct = await Product.findById(productId);
  if (!findProduct)
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  const { productType, variant } = findProduct;
  let variantType = null;
  let matchedVariant = null;

  if (productType === "variant") {
    variantType = variant?.variantType;

    if (variantType === "sizeColor") {
      matchedVariant = variant.sizeColorVariants.find(
        (v) => v._id === variantId,
      );
    } else if (variantType === "colorOnly") {
      matchedVariant = variant.colorOnlyVariants.find(
        (v) => v._id === variantId,
      );
    } else if (variantType === "sizeOnly") {
      matchedVariant = variant.sizeOnlyVariants.find(
        (v) => v._id === variantId,
      );
    }

    if (!matchedVariant)
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Variant not found for this product",
      );
  }

  let userWishlist = await wishlistSchema.findOne(cartQuery);

  if (!userWishlist) {
    userWishlist = await wishlistSchema.create({
      ...cartQuery,
      items: [
        {
          productId,
          variantId: variantId || null,
          productType,
          variantType: variantType || null,
        },
      ],
    });

    return {
      success: true,
      message: "Product added to wishlist successfully",
      data: userWishlist,
    };
  }

  const alreadyExists = userWishlist.items.some(
    (item) =>
      item.productId === productId &&
      (item.variantId === variantId || (!variantId && !item.variantId)),
  );

  if (alreadyExists) {
    return {
      success: false,
      message: "Product already in wishlist",
      data: userWishlist,
    };
  }

  userWishlist.items.push({
    productId,
    variantId: variantId || null,
    productType,
    variantType: variantType || null,
  });

  const updatedWishlist = await userWishlist.save();

  return {
    success: true,
    message: "Wishlist updated successfully",
    data: updatedWishlist,
  };
};

const getWishlist = async (req) => {
  const userId = req.user?._id || null;
  const guestId = req.headers.guestid || req.headers["guest-id"] || null;

  console.log("GUEST ID:", guestId);

  // ❗ At least one must exist
  if (!userId && !guestId) {
    throw new ApiError(400, "User or Guest ID required");
  }

  // 🟢 Decide cart owner
  const matchStage = userId ? { userId } : { guestId };

  const wishlistProduct = await wishlistSchema.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "product",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🧠 Lookup cart items for the same user
    {
      $lookup: {
        from: "carts",
        let: {
          wishlistVariantId: "$items.variantId",
          wishlistProductId: "$items.productId",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $cond: [
                  { $ne: [userId, null] },
                  { $eq: ["$userId", userId] },
                  { $eq: ["$guestId", guestId] },
                ],
              },
            },
          },
          { $unwind: "$items" },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$items.variantId", "$$wishlistVariantId"] },
                  { $eq: ["$items.productId", "$$wishlistProductId"] },
                ],
              },
            },
          },
        ],
        as: "cartMatch",
      },
    },

    {
      $addFields: {
        isInCart: { $gt: [{ $size: "$cartMatch" }, 0] },
      },
    },

    // 🧩 Add selectedVariant based on variantType or productType
    {
      $addFields: {
        selectedVariant: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$items.variantType", "colorOnly"] },
                then: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: {
                          $cond: [
                            { $isArray: "$product.variant.colorOnlyVariants" },
                            "$product.variant.colorOnlyVariants",
                            [], // fallback empty array
                          ],
                        },
                        as: "v",
                        cond: {
                          $eq: [{ $toString: "$$v._id" }, "$items.variantId"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              {
                case: { $eq: ["$items.variantType", "sizeOnly"] },
                then: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: {
                          $cond: [
                            { $isArray: "$product.variant.sizeOnlyVariants" },
                            "$product.variant.sizeOnlyVariants",
                            [],
                          ],
                        },
                        as: "v",
                        cond: {
                          $eq: [{ $toString: "$$v._id" }, "$items.variantId"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              {
                case: { $eq: ["$items.variantType", "sizeColor"] },
                then: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: {
                          $cond: [
                            { $isArray: "$product.variant.sizeColorVariants" },
                            "$product.variant.sizeColorVariants",
                            [],
                          ],
                        },
                        as: "v",
                        cond: {
                          $eq: [{ $toString: "$$v._id" }, "$items.variantId"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
              {
                case: { $eq: ["$items.productType", "nonVariant"] },
                then: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: {
                          $cond: [
                            { $isArray: "$product.nonVariant" },
                            "$product.nonVariant",
                            ["$product.nonVariant"], // ✅ wrap single object into array
                          ],
                        },
                        as: "nv",
                        cond: {
                          $eq: [{ $toString: "$$nv._id" }, "$items.variantId"],
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            ],
            default: null,
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        productId: "$product._id",
        productName: "$product.productName",
        productImage: "$product.productImage",
        productType: "$items.productType",
        variantType: "$items.variantType",
        selectedVariant: 1,
        isInCart: 1,
        variantId: "$items.variantId",
      },
    },
  ]);

  return {
    success: true,
    message: "Wishlist products fetched successfully",
    data: wishlistProduct,
  };
};

const updateWishList = async (req) => {
  const { productId, variantId } = req.query;
  const userId = req.user?._id || null;
  const guestId = req.headers.guestid || req.headers["guest-id"] || null;

  console.log("GUEST ID:", guestId);

  // ❗ At least one must exist
  if (!userId && !guestId) {
    throw new ApiError(400, "User or Guest ID required");
  }

  // 🟢 Decide cart owner
  const cartQuery = userId ? { userId } : { guestId };
  if (!productId)
    throw new ApiError(httpStatus.BAD_REQUEST, "Product ID is required");

  const findProduct = await Product.findById(productId);
  if (!findProduct)
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");

  const findWishList = await wishlistSchema.findOne(cartQuery);
  if (!findWishList)
    throw new ApiError(httpStatus.NOT_FOUND, "No wishlist found");

  if (!findWishList.items || findWishList.items.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Wishlist is empty");
  }

  const filteredItems = findWishList.items.filter((item) => {
    if (variantId) {
      return !(item.productId === productId && item.variantId === variantId);
    }
    return item.productId !== productId;
  });

  const updatedWishList = await wishlistSchema.findOneAndUpdate(
    cartQuery,
    { items: filteredItems },
    { new: true },
  );

  return {
    success: true,
    message: "Product removed from wishlist successfully",
    data: updatedWishList,
  };
};

const removeWishlist = async (req) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "user Must Login");
  }
  const { _id } = req.params;

  const deletedproduct = await wishlistSchema.findOneAndDelete({ userId });

  if (!deletedproduct) {
    throw new ApiError(404, "Product not found in the Wishlist");
  }

  return {
    success: true,
    message: "Product removed from the Wishlist Successfully",
    data: deletedproduct,
  };
};

const mergeWishlist = async (req, res) => {
  try {
    // 1️⃣ Authenticated user
    const userId = req.user._id;

    // 2️⃣ Guest id from header
    const guestId = req.headers.guestid || req.headers["guest-id"];

    // 3️⃣ Nothing to merge
    if (!guestId) {
      return {
        success: true,
        message: "No guest wishlist to merge",
      }
    }

    // 4️⃣ Fetch wishlists
    const guestWishlist = await wishlistSchema.findOne({ guestId });
    const userWishlist = await wishlistSchema.findOne({ userId });

    // 5️⃣ CASE 1: Guest + User wishlist exists → MERGE
    if (guestWishlist && userWishlist) {
      guestWishlist.items.forEach((gItem) => {
        const exists = userWishlist.items.some(
          (uItem) =>
            uItem.productId.toString() === gItem.productId.toString()
        );

        if (!exists) {
          userWishlist.items.push(gItem);
        }
      });

      await userWishlist.save();
      await wishlistSchema.deleteOne({ guestId });
    }

    // 6️⃣ CASE 2: Guest wishlist exists, User wishlist NOT exists → CONVERT
    else if (guestWishlist && !userWishlist) {
      guestWishlist.userId = userId;
      guestWishlist.guestId = null;
      await guestWishlist.save();
    }

    // 7️⃣ CASE 3: No guest wishlist → nothing

    return {
      success: true,
      message: "Wishlist merged successfully",
    }
  } catch (error) {
    console.error("Merge wishlist error:", error);
    return {
      success: false,
      message: "Wishlist merge failed",
    }
  }
};


module.exports = {
  addWishlist,
  getWishlist,
  updateWishList,
  removeWishlist,
  mergeWishlist
};
