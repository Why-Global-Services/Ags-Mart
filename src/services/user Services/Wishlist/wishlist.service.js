const { Product } = require("../../../models/Product.model");
const { wishlistSchema } = require("../../../models/wishlist.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");
const { findProductVariant } = require("../../../utils/productVariant");

// ============================================================
// ADD PRODUCT TO WISHLIST
// ============================================================
const addWishlist = async (req) => {
  const { productId, variantId } = req.query;

  const userId = req.user?._id || null;
  const guestId =
    req.headers.guestid ||
    req.headers["guest-id"] ||
    null;

  console.log("GUEST ID:", guestId);

  // At least one owner must exist
  if (!userId && !guestId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User or Guest ID required"
    );
  }

  const wishlistQuery = userId ? { userId } : { guestId };

  if (!productId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product ID is required"
    );
  }

  const findProduct = await Product.findById(productId);

  if (!findProduct) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product not found"
    );
  }

  const { productType } = findProduct;

  const variantType =
    findProduct.variant?.variantType || null;

  // ----------------------------------------------------------
  // Validate variant
  // ----------------------------------------------------------
  if (productType === "variant") {
    if (!variantId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Variant ID is required for variant product"
      );
    }

    const selectedVariant = findProductVariant(
      findProduct,
      variantId
    );

    if (!selectedVariant) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Variant not found for this product"
      );
    }
  }

  // ----------------------------------------------------------
  // Find existing wishlist
  // ----------------------------------------------------------
  let userWishlist = await wishlistSchema.findOne(
    wishlistQuery
  );

  // ----------------------------------------------------------
  // Create new wishlist
  // ----------------------------------------------------------
  if (!userWishlist) {
    userWishlist = await wishlistSchema.create({
      ...wishlistQuery,
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

  // ----------------------------------------------------------
  // Check duplicate
  // ----------------------------------------------------------
  const alreadyExists = userWishlist.items.some(
    (item) =>
      String(item.productId) === String(productId) &&
      (
        String(item.variantId || "") ===
          String(variantId || "")
      )
  );

  if (alreadyExists) {
    return {
      success: false,
      message: "Product already in wishlist",
      data: userWishlist,
    };
  }

  // ----------------------------------------------------------
  // Add new wishlist item
  // ----------------------------------------------------------
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

// ============================================================
// GET WISHLIST
// ============================================================
const getWishlist = async (req) => {
  const userId = req.user?._id || null;

  const guestId =
    req.headers.guestid ||
    req.headers["guest-id"] ||
    null;

  console.log("GUEST ID:", guestId);

  // At least one owner must exist
  if (!userId && !guestId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User or Guest ID required"
    );
  }

  const matchStage = userId
    ? { userId }
    : { guestId };

  const wishlistProduct =
    await wishlistSchema.aggregate([
      // ======================================================
      // FIND USER / GUEST WISHLIST
      // ======================================================
      {
        $match: matchStage,
      },

      // ======================================================
      // UNWIND WISHLIST ITEMS
      // ======================================================
      {
        $unwind: "$items",
      },

      // ======================================================
      // GET PRODUCT
      // ======================================================
      {
        $lookup: {
          from: "product",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: "$product",
      },

      // ======================================================
      // CHECK WHETHER PRODUCT IS ALREADY IN CART
      // ======================================================
      {
        $lookup: {
          from: "carts",

          let: {
            wishlistVariantId:
              "$items.variantId",

            wishlistProductId:
              "$items.productId",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $cond: [
                    {
                      $ne: [userId, null],
                    },
                    {
                      $eq: [
                        "$userId",
                        userId,
                      ],
                    },
                    {
                      $eq: [
                        "$guestId",
                        guestId,
                      ],
                    },
                  ],
                },
              },
            },

            {
              $unwind: "$items",
            },

            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$items.productId",
                        "$$wishlistProductId",
                      ],
                    },

                    {
                      $eq: [
                        "$items.variantId",
                        "$$wishlistVariantId",
                      ],
                    },
                  ],
                },
              },
            },
          ],

          as: "cartMatch",
        },
      },

      // ======================================================
      // IS IN CART
      // ======================================================
      {
        $addFields: {
          isInCart: {
            $gt: [
              {
                $size: "$cartMatch",
              },
              0,
            ],
          },
        },
      },

      // ======================================================
      // GET SELECTED VARIANT
      // ======================================================
      {
        $addFields: {
          selectedVariant: {
            $switch: {
              branches: [
                // ------------------------------------------------
                // UNIT ONLY VARIANT
                // ------------------------------------------------
                {
                  case: {
                    $eq: [
                      "$items.variantType",
                      "unitOnly",
                    ],
                  },

                  then: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: {
                            $cond: [
                              {
                                $isArray:
                                  "$product.variant.unitOnlyVariants",
                              },

                              "$product.variant.unitOnlyVariants",

                              [],
                            ],
                          },

                          as: "v",

                          cond: {
                            $eq: [
                              {
                                $toString:
                                  "$$v._id",
                              },

                              {
                                $toString:
                                  "$items.variantId",
                              },
                            ],
                          },
                        },
                      },

                      0,
                    ],
                  },
                },

                // ------------------------------------------------
                // NON VARIANT
                // ------------------------------------------------
                {
                  case: {
                    $eq: [
                      "$items.productType",
                      "nonVariant",
                    ],
                  },

                  then: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: {
                            $cond: [
                              {
                                $isArray:
                                  "$product.nonVariant",
                              },

                              "$product.nonVariant",

                              {
                                $cond: [
                                  {
                                    $ne: [
                                      "$product.nonVariant",
                                      null,
                                    ],
                                  },

                                  [
                                    "$product.nonVariant",
                                  ],

                                  [],
                                ],
                              },
                            ],
                          },

                          as: "nv",

                          cond: {
                            $eq: [
                              {
                                $toString:
                                  "$$nv._id",
                              },

                              {
                                $toString:
                                  "$items.variantId",
                              },
                            ],
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

      // ======================================================
      // RESOLVE WISHLIST IMAGE
      // ======================================================
      {
        $addFields: {
          wishlistImages: {
            $cond: [
              // ------------------------------------------------
              // UNIT VARIANT IMAGE EXISTS
              // ------------------------------------------------
              {
                $and: [
                  {
                    $eq: [
                      "$items.productType",
                      "variant",
                    ],
                  },

                  {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            "$selectedVariant.variantImages",
                            [],
                          ],
                        },
                      },

                      0,
                    ],
                  },
                ],
              },

              // Use selected variant images
              "$selectedVariant.variantImages",

              // ------------------------------------------------
              // OTHERWISE MAIN PRODUCT IMAGES
              // ------------------------------------------------
              {
                $ifNull: [
                  "$product.productImages",
                  [],
                ],
              },
            ],
          },
        },
      },

      // ======================================================
      // PROJECT FINAL RESPONSE
      // ======================================================
      {
        $project: {
          _id: 0,

          productId:
            "$product._id",

          productName:
            "$product.productName",

          productTitle:
            "$product.productTitle",

          // --------------------------------------------------
          // MAIN PRODUCT IMAGES
          // --------------------------------------------------
          productImages: {
            $ifNull: [
              "$product.productImages",
              [],
            ],
          },

          // --------------------------------------------------
          // RESOLVED DISPLAY IMAGES
          //
          // Variant image first.
          // Main product image fallback.
          // --------------------------------------------------
          wishlistImages: 1,

          // --------------------------------------------------
          // BACKWARD COMPATIBILITY
          // Frontend code expecting productImage can still work.
          // --------------------------------------------------
          productImage: {
            $arrayElemAt: [
              "$wishlistImages",
              0,
            ],
          },

          // --------------------------------------------------
          // PRODUCT INFORMATION
          // --------------------------------------------------
          productType:
            "$items.productType",

          variantType:
            "$items.variantType",

          variantId:
            "$items.variantId",

          // --------------------------------------------------
          // SELECTED VARIANT
          // --------------------------------------------------
          selectedVariant: 1,

          // --------------------------------------------------
          // CART STATUS
          // --------------------------------------------------
          isInCart: 1,
        },
      },
    ]);

  return {
    success: true,
    message:
      "Wishlist products fetched successfully",
    data: wishlistProduct,
  };
};

// ============================================================
// REMOVE / UPDATE WISHLIST
// ============================================================
const updateWishList = async (req) => {
  const { productId, variantId } = req.query;

  const userId = req.user?._id || null;

  const guestId =
    req.headers.guestid ||
    req.headers["guest-id"] ||
    null;

  console.log("GUEST ID:", guestId);

  if (!userId && !guestId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User or Guest ID required"
    );
  }

  const wishlistQuery = userId
    ? { userId }
    : { guestId };

  if (!productId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product ID is required"
    );
  }

  const findProduct =
    await Product.findById(productId);

  if (!findProduct) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product not found"
    );
  }

  const findWishList =
    await wishlistSchema.findOne(
      wishlistQuery
    );

  if (!findWishList) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No wishlist found"
    );
  }

  if (
    !findWishList.items ||
    findWishList.items.length === 0
  ) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Wishlist is empty"
    );
  }

  const filteredItems =
    findWishList.items.filter((item) => {
      if (variantId) {
        return !(
          String(item.productId) ===
            String(productId) &&
          String(item.variantId || "") ===
            String(variantId)
        );
      }

      return (
        String(item.productId) !==
        String(productId)
      );
    });

  const updatedWishList =
    await wishlistSchema.findOneAndUpdate(
      wishlistQuery,
      {
        items: filteredItems,
      },
      {
        new: true,
      }
    );

  return {
    success: true,
    message:
      "Product removed from wishlist successfully",
    data: updatedWishList,
  };
};

// ============================================================
// REMOVE ENTIRE USER WISHLIST
// ============================================================
const removeWishlist = async (req) => {
  const userId = req.user?._id || null;

  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "user Must Login"
    );
  }

  const { _id } = req.params;

  const deletedproduct =
    await wishlistSchema.findOneAndDelete({
      userId,
    });

  if (!deletedproduct) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product not found in the Wishlist"
    );
  }

  return {
    success: true,
    message:
      "Product removed from the Wishlist Successfully",
    data: deletedproduct,
  };
};

// ============================================================
// MERGE GUEST WISHLIST WITH USER WISHLIST
// ============================================================
const mergeWishlist = async (req, res) => {
  try {
    const userId = req.user?._id || null;

    const guestId =
      req.headers.guestid ||
      req.headers["guest-id"] ||
      null;

    if (!userId) {
      return {
        success: false,
        message: "User authentication required",
      };
    }

    if (!guestId) {
      return {
        success: true,
        message:
          "No guest wishlist to merge",
      };
    }

    const guestWishlist =
      await wishlistSchema.findOne({
        guestId,
      });

    const userWishlist =
      await wishlistSchema.findOne({
        userId,
      });

    // ========================================================
    // GUEST + USER WISHLIST BOTH EXIST
    // ========================================================
    if (
      guestWishlist &&
      userWishlist
    ) {
      guestWishlist.items.forEach(
        (gItem) => {
          const exists =
            userWishlist.items.some(
              (uItem) =>
                String(
                  uItem.productId
                ) ===
                  String(
                    gItem.productId
                  ) &&
                String(
                  uItem.variantId || ""
                ) ===
                  String(
                    gItem.variantId || ""
                  )
            );

          if (!exists) {
            userWishlist.items.push(
              gItem
            );
          }
        }
      );

      await userWishlist.save();

      await wishlistSchema.deleteOne({
        guestId,
      });
    }

    // ========================================================
    // ONLY GUEST WISHLIST EXISTS
    // ========================================================
    else if (
      guestWishlist &&
      !userWishlist
    ) {
      guestWishlist.userId =
        userId;

      guestWishlist.guestId = null;

      await guestWishlist.save();
    }

    return {
      success: true,
      message:
        "Wishlist merged successfully",
    };
  } catch (error) {
    console.error(
      "Merge wishlist error:",
      error
    );

    return {
      success: false,
      message:
        "Wishlist merge failed",
    };
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  addWishlist,
  getWishlist,
  updateWishList,
  removeWishlist,
  mergeWishlist,
};