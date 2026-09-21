const { Product } = require("../../../models/Product.model");
const { cart } = require("../../../models/cart.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");
const { findProductVariant } = require("../../../utils/productVariant");

// ============================================================
// ADD TO CART
// ============================================================
const addToCart = async (req) => {
  const { quantity = 1 } = req.body;
  const productId = req.query.productId || req.body.productId;
  const variantId = req.query.variantId || req.body.variantId;

  const userId = req.user?._id || null;

  const guestId =
    req.headers.guestid ||
    req.headers["guest-id"] ||
    null;

  if (!userId && !guestId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User or Guest ID required"
    );
  }

  if (!productId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product ID is required"
    );
  }

  const numericQuantity = Number(quantity);

  if (
    !Number.isFinite(numericQuantity) ||
    numericQuantity < 1
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Quantity must be at least 1"
    );
  }

  const cartQuery = userId
    ? { userId }
    : { guestId };

  // ==========================================================
  // PRODUCT
  // ==========================================================
  const product =
    await Product.findById(productId);

  if (!product) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product not found"
    );
  }

  const {
    productType,
    nonVariant,
  } = product;

  let selectedVariant = null;

  // ==========================================================
  // VARIANT
  // ==========================================================
  if (
    productType === "variant"
  ) {
    if (product.variant?.variantType !== "unitOnly") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Only unitOnly variant products are supported"
      );
    }

    const requestedVariantType = req.body.variantType || req.query.variantType;
    if (requestedVariantType && requestedVariantType !== "unitOnly") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Only unitOnly variant products are supported"
      );
    }

    if (!variantId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Variant ID is required for variant product"
      );
    }

    selectedVariant =
      findProductVariant(
        product,
        variantId
      );

    if (!selectedVariant) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Variant not found"
      );
    }

    const stock =
      Number(
        selectedVariant.stockCount ||
          0
      );

    if (
      stock <
      numericQuantity
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Insufficient stock"
      );
    }
  }

  // ==========================================================
  // NON VARIANT
  // ==========================================================
  else if (
    productType ===
    "nonVariant"
  ) {
    if (!nonVariant) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Product details missing"
      );
    }

    const stock =
      Number(
        nonVariant.stockCount ||
          0
      );

    if (
      stock <
      numericQuantity
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Insufficient stock"
      );
    }
  }

  // ==========================================================
  // INVALID TYPE
  // ==========================================================
  else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid product type"
    );
  }

  // ==========================================================
  // FIND CART
  // ==========================================================
  let userCart =
    await cart.findOne(
      cartQuery
    );

  // ==========================================================
  // CREATE CART
  // ==========================================================
  if (!userCart) {
    userCart =
      await cart.create({
        ...cartQuery,

        items: [
          {
            productId,

            variantId:
              variantId || null,

            productType,

            quantity:
              numericQuantity,
          },
        ],
      });

    return {
      success: true,

      message:
        "Product added to cart",

      data: userCart,
    };
  }

  // ==========================================================
  // EXISTING ITEM
  // ==========================================================
  const item =
    userCart.items.find(
      (cartItem) =>
        String(
          cartItem.productId
        ) ===
          String(productId) &&
        String(
          cartItem.variantId || ""
        ) ===
          String(
            variantId || ""
          )
    );

  if (item) {
    item.quantity =
      numericQuantity;
  } else {
    userCart.items.push({
      productId,

      variantId:
        variantId || null,

      productType,

      quantity:
        numericQuantity,
    });
  }

  await userCart.save();

  return {
    success: true,

    message: item
      ? "Cart updated"
      : "Product added to cart",

    data: userCart,
  };
};

// ============================================================
// GET CART
// ============================================================
const getCart = async (req) => {
  const userId =
    req.user?._id || null;

  const guestId =
    req.headers.guestid ||
    req.headers["guest-id"] ||
    null;

  console.log(
    "========== GET CART =========="
  );

  console.log(
    "USER ID:",
    userId
  );

  console.log(
    "GUEST ID:",
    guestId
  );

  if (!userId && !guestId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User or Guest ID required"
    );
  }

  const cartQuery = userId
    ? { userId }
    : { guestId };

  const cartData =
    await cart.findOne(
      cartQuery
    ).lean();

  // ==========================================================
  // EMPTY CART
  // ==========================================================
  if (
    !cartData ||
    !Array.isArray(
      cartData.items
    ) ||
    cartData.items.length === 0
  ) {
    return {
      success: false,

      message:
        "No products in the cart",

      totalPrice: 0,

      totalCostPrice: 0,

      totalDiscount: 0,

      items: [],
    };
  }

  // ==========================================================
  // PROCESS EACH CART ITEM
  // ==========================================================
  const cartItems = [];

  for (
    const cartItem of cartData.items
  ) {
    try {
      // ------------------------------------------------------
      // PRODUCT
      // ------------------------------------------------------
      const product =
        await Product.findById(
          cartItem.productId
        ).lean();

      if (!product) {
        console.warn(
          "Product not found in cart:",
          cartItem.productId
        );

        continue;
      }

      console.log(
        "CART PRODUCT:",
        product.productName
      );

      console.log(
        "PRODUCT IMAGES:",
        product.productImages
      );

      // ------------------------------------------------------
      // PRODUCT IMAGE
      // ------------------------------------------------------
      const mainProductImages =
        Array.isArray(
          product.productImages
        )
          ? product.productImages.filter(
              Boolean
            )
          : [];

      let resolvedImages = [
        ...mainProductImages,
      ];

      // ------------------------------------------------------
      // VARIANT
      // ------------------------------------------------------
      let selectedVariant =
        null;

      if (
        product.productType ===
        "variant"
      ) {
        if (
          cartItem.variantId
        ) {
          selectedVariant =
            findProductVariant(
              product,
              cartItem.variantId
            );
        }

        // ----------------------------------------------------
        // VARIANT IMAGE
        // ----------------------------------------------------
        const variantImages =
          Array.isArray(
            selectedVariant?.variantImages
          )
            ? selectedVariant.variantImages.filter(
                Boolean
              )
            : [];

        if (
          variantImages.length >
          0
        ) {
          resolvedImages =
            variantImages;
        }
      }

      // ------------------------------------------------------
      // NON VARIANT
      // ------------------------------------------------------
      const nonVariant =
        product.nonVariant ||
        null;

      if (
        product.productType ===
        "nonVariant"
      ) {
        const nonVariantImages =
          Array.isArray(
            nonVariant?.nonVariantImages
          )
            ? nonVariant.nonVariantImages.filter(
                Boolean
              )
            : [];

        if (
          nonVariantImages.length >
          0
        ) {
          resolvedImages =
            nonVariantImages;
        }
      }

      // ------------------------------------------------------
      // FINAL IMAGE FALLBACK
      // ------------------------------------------------------
      if (
        !Array.isArray(
          resolvedImages
        )
      ) {
        resolvedImages = [];
      }

      // Main product images are ALWAYS
      // used as final fallback.
      if (
        resolvedImages.length ===
          0 &&
        mainProductImages.length >
          0
      ) {
        resolvedImages = [
          ...mainProductImages,
        ];
      }

      console.log(
        "FINAL CART IMAGES:",
        resolvedImages
      );

      // ------------------------------------------------------
      // PRICE
      // ------------------------------------------------------
      let priceData = null;

      if (
        product.productType ===
        "variant"
      ) {
        priceData =
          selectedVariant?.price ||
          product.price ||
          {};
      } else {
        priceData =
          nonVariant?.price ||
          product.price ||
          {};
      }

      const costPrice =
        Number(
          priceData.costPrice ||
            0
        );

      const salePrice =
        Number(
          priceData.salePrice ||
            0
        );

      const quantity =
        Number(
          cartItem.quantity ||
            1
        );

      // ------------------------------------------------------
      // DISCOUNT
      // ------------------------------------------------------
      let discountPercentage =
        Number(
          priceData.discount ||
            0
        );

      if (
        discountPercentage ===
          0 &&
        costPrice > 0 &&
        salePrice <
          costPrice
      ) {
        discountPercentage =
          ((costPrice -
            salePrice) /
            costPrice) *
          100;
      }

      const discountAmount =
        Math.max(
          costPrice -
            salePrice,
          0
        );

      const totalItemPrice =
        salePrice *
        quantity;

      const totalDiscountAmount =
        discountAmount *
        quantity;

      // ------------------------------------------------------
      // SELECTED VALUES (unitOnly only)
      // ------------------------------------------------------
      const selectedUnit =
        selectedVariant?.unit ||
        null;

      // ------------------------------------------------------
      // PUSH CART ITEM
      // ------------------------------------------------------
      cartItems.push({
        productId:
          product._id,

        variantId:
          cartItem.variantId ||
          null,

        quantity,

        productName:
          product.productName,

        productTitle:
          product.productTitle ||
          product.productName,

        productType:
          cartItem.productType ||
          product.productType,

        // ====================================================
        // IMPORTANT
        // ====================================================
        productImages:
          resolvedImages,

        // Backward compatibility
        productImage:
          resolvedImages[0] ||
          null,

        selectedUnit,

        selectedVariant:
          selectedVariant ||
          null,

        status:
          product.status ||
          "active",

        // Product-level base price
        basePrice:
          Number(
            product.basePrice ||
              0
          ),

        priceBreakdown: {
          costPrice,

          salePrice,

          discountPercentage,

          discountAmount,

          totalItemPrice,

          totalDiscountAmount,
        },
      });
    } catch (error) {
      console.error(
        "Error processing cart item:",
        cartItem.productId,
        error
      );
    }
  }

  // ==========================================================
  // TOTALS
  // ==========================================================
  const totalPrice =
    cartItems.reduce(
      (sum, item) => {
        if (
          item.status ===
          "active"
        ) {
          return (
            sum +
            Number(
              item.priceBreakdown
                ?.totalItemPrice ||
                0
            )
          );
        }

        return sum;
      },
      0
    );

  const totalCostPrice =
    cartItems.reduce(
      (sum, item) => {
        if (
          item.status ===
          "active"
        ) {
          return (
            sum +
            Number(
              item.priceBreakdown
                ?.costPrice ||
                0
            ) *
              Number(
                item.quantity ||
                  1
              )
          );
        }

        return sum;
      },
      0
    );

  const totalDiscount =
    cartItems.reduce(
      (sum, item) => {
        if (
          item.status ===
          "active"
        ) {
          return (
            sum +
            Number(
              item.priceBreakdown
                ?.totalDiscountAmount ||
                0
            )
          );
        }

        return sum;
      },
      0
    );

  console.log(
    "FINAL CART ITEM COUNT:",
    cartItems.length
  );

  console.log(
    "FINAL CART RESPONSE IMAGES:",
    cartItems.map(
      (item) => ({
        productId:
          item.productId,

        productName:
          item.productName,

        productImages:
          item.productImages,
      })
    )
  );

  console.log(
    "========== GET CART END =========="
  );

  return {
    success: true,

    message:
      "Cart fetched successfully",

    totalPrice,

    totalCostPrice,

    totalDiscount,

    items: cartItems,
  };
};

// ============================================================
// EDIT CART
// ============================================================
const editCart = async (
  req,
  res
) => {
  const userId =
    req.user?._id || null;

  const guestId =
    req.headers.guestid ||
    req.headers["guest-id"] ||
    null;

  if (!userId && !guestId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User or Guest ID required"
    );
  }

  const cartQuery = userId
    ? { userId }
    : { guestId };

  const variantId =
    req.query.variantId ||
    req.body.variantId;

  if (!variantId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No variantId provided"
    );
  }

  const findCart =
    await cart.findOne(
      cartQuery
    );

  if (!findCart) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No cart found"
    );
  }

  findCart.items =
    findCart.items.filter(
      (item) =>
        String(
          item.variantId || ""
        ) !==
        String(variantId)
    );

  await findCart.save();

  return {
    success: true,

    message:
      "Cart edited successfully",

    data: findCart,
  };
};

// ============================================================
// DELETE CART
// ============================================================
const deleteCart = async (
  req
) => {
  const userId =
    req.user?._id || null;

  const guestId =
    req.headers.guestid ||
    req.headers["guest-id"] ||
    null;

  if (!userId && !guestId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User or Guest ID required"
    );
  }

  const { _id } =
    req.params;

  if (!_id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cart item ID is required"
    );
  }

  const deletedCartItem =
    await cart.findByIdAndDelete(
      _id
    );

  if (!deletedCartItem) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Cart item not found"
    );
  }

  return {
    success: true,

    message:
      "Product removed from the cart successfully",

    data:
      deletedCartItem,
  };
};

// ============================================================
// ADD ADDRESS TO CART
// ============================================================
const addAddressToCart = async (
  req,
  res
) => {
  const {
    deliveryAddress,
    billingAddress,
  } = req.body;

  const address = {};

  if (deliveryAddress) {
    address.deliveryAddressId =
      deliveryAddress;
  }

  if (billingAddress) {
    address.billingAddressId =
      billingAddress;
  }

  const userId =
    req.user?._id;

  if (!userId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User authentication required"
    );
  }

  const updateCartAddress =
    await cart.findOneAndUpdate(
      { userId },
      address,
      {
        new: true,
      }
    );

  return {
    success: true,

    message:
      "Address Updated",

    data:
      updateCartAddress,
  };
};

// ============================================================
// MERGE CART
// ============================================================
const mergeCart = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?._id;

    const guestId =
      req.headers.guestid ||
      req.headers["guest-id"];

    if (!userId) {
      return {
        success: false,

        message:
          "User authentication required",
      };
    }

    if (!guestId) {
      return {
        success: true,

        message:
          "No guest cart to merge",
      };
    }

    const guestCart =
      await cart.findOne({
        guestId,
      });

    const userCart =
      await cart.findOne({
        userId,
      });

    if (
      guestCart &&
      userCart
    ) {
      guestCart.items.forEach(
        (guestItem) => {
          const existingItem =
            userCart.items.find(
              (userItem) =>
                String(
                  userItem.productId
                ) ===
                  String(
                    guestItem.productId
                  ) &&
                String(
                  userItem.variantId ||
                    ""
                ) ===
                  String(
                    guestItem.variantId ||
                      ""
                  )
            );

          if (existingItem) {
            existingItem.quantity =
              Number(
                existingItem.quantity ||
                  0
              ) +
              Number(
                guestItem.quantity ||
                  0
              );
          } else {
            userCart.items.push(
              guestItem
            );
          }
        }
      );

      await userCart.save();

      await cart.deleteOne({
        guestId,
      });
    } else if (
      guestCart &&
      !userCart
    ) {
      guestCart.userId =
        userId;

      guestCart.guestId =
        null;

      await guestCart.save();
    }

    return {
      success: true,

      message:
        "Cart merged successfully",
    };
  } catch (error) {
    console.error(
      "Merge cart error:",
      error
    );

    return {
      success: false,

      message:
        "Cart merge failed",
    };
  }
};

// ============================================================
// EXPORT
// ============================================================
module.exports = {
  addToCart,
  getCart,
  editCart,
  deleteCart,
  addAddressToCart,
  mergeCart,
};